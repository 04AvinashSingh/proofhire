import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  applications,
  applicationStatusHistory,
  evaluationNotes,
  evidenceMappings,
  jobs,
  jobRequirements,
  organisations,
  users,
  candidateProfiles,
  projects,
  projectEvidence,
} from "../db/schema/index.js";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from "../errors/AppError.js";
import {
  isValidStatusTransition,
  type ApplyToJobRequest,
  type UpdateApplicationStatusRequest,
  type CreateEvaluationNoteRequest,
  type ApplicationStatus,
  type AntiGhostingSlaStatus,
  type CandidateApplicationSummaryDto,
  type ApplicationDetailDto,
  type EvaluationNoteDto,
  type ApplicationStatusHistoryDto,
  type EvidenceMappingDto,
} from "@proofhire/shared-contracts";
import { JobService } from "./jobService.js";
import { auditService } from "./auditService.js";

// SLA Constant: 7 calendar days SLA for candidate response
const SLA_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const AT_RISK_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000; // 48 hours

export class ApplicationService {
  /**
   * Helper to compute Anti-Ghosting SLA state.
   */
  public static computeSlaStatus(
    status: ApplicationStatus,
    slaDeadline: Date | null
  ): AntiGhostingSlaStatus {
    if (status === "HIRED" || status === "REJECTED" || !slaDeadline) {
      return "ON_TRACK";
    }

    const now = Date.now();
    const deadlineTime = slaDeadline.getTime();

    if (now > deadlineTime) {
      return "BREACHED";
    }

    if (deadlineTime - now <= AT_RISK_THRESHOLD_MS) {
      return "AT_RISK";
    }

    return "ON_TRACK";
  }

  /**
   * Helper to compute days spent in current stage.
   */
  public static computeDaysInStage(updatedAt: Date): number {
    const diffMs = Date.now() - updatedAt.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  /**
   * Candidate applies to a published job.
   */
  public static async applyToJob(
    jobId: string,
    candidateUserId: string,
    dto: ApplyToJobRequest
  ): Promise<CandidateApplicationSummaryDto> {
    // 1. Check job is published
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));
    if (!job) {
      throw new NotFoundError("Job not found");
    }
    if (job.status !== "PUBLISHED") {
      throw new ForbiddenError("Applications are not currently open for this position");
    }

    // 2. Fetch candidate profile
    const [profile] = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, candidateUserId));

    if (!profile) {
      throw new BadRequestError("You must set up a candidate profile before applying to jobs");
    }

    // 3. Check duplicate application constraint
    const [existing] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(
        and(
          eq(applications.jobId, jobId),
          eq(applications.candidateId, candidateUserId)
        )
      );

    if (existing) {
      throw new ConflictError("You have already submitted an application for this position");
    }

    const slaDeadline = new Date(Date.now() + SLA_DURATION_MS);

    const result = await db.transaction(async (tx) => {
      // Insert application
      const [newApp] = await tx
        .insert(applications)
        .values({
          jobId,
          candidateId: candidateUserId,
          coverNote: dto.coverNote || null,
          status: "APPLIED",
          slaDeadline,
        })
        .returning();

      if (!newApp) {
        throw new Error("Failed to create application record");
      }

      // Record initial status history
      await tx.insert(applicationStatusHistory).values({
        applicationId: newApp.id,
        fromStatus: null,
        toStatus: "APPLIED",
        changedBy: candidateUserId,
        reason: "Application submitted by candidate",
      });

      // Mappings
      const candidateProjects = await tx
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.candidateId, profile.id));

      const candidateProjectIds = candidateProjects.map((p) => p.id);

      if (candidateProjectIds.length > 0) {
        // Fetch candidate's available evidence
        const candidateEvidences = await tx
          .select()
          .from(projectEvidence)
          .where(inArray(projectEvidence.projectId, candidateProjectIds));

        const evidenceMap = new Map(candidateEvidences.map((e) => [e.id, e]));

        // Process explicit mappings
        if (dto.evidenceMappings && dto.evidenceMappings.length > 0) {
          for (const mapping of dto.evidenceMappings) {
            if (evidenceMap.has(mapping.projectEvidenceId)) {
              await tx.insert(evidenceMappings).values({
                applicationId: newApp.id,
                jobRequirementId: mapping.jobRequirementId,
                projectEvidenceId: mapping.projectEvidenceId,
                relevanceReason: "Linked directly by candidate during application",
                isAiAssisted: false,
              });
            }
          }
        }

        // Auto-match remaining requirements by skill tags
        const requirements = await tx
          .select()
          .from(jobRequirements)
          .where(eq(jobRequirements.jobId, jobId));

        const alreadyMappedReqIds = new Set(
          (dto.evidenceMappings || []).map((m) => m.jobRequirementId)
        );

        for (const req of requirements) {
          if (!alreadyMappedReqIds.has(req.id) && req.skillTags && req.skillTags.length > 0) {
            const matchedEvidence = candidateEvidences.find((ev) =>
              ev.skillTags?.some((tag) =>
                req.skillTags?.some((rt) => rt.toLowerCase() === tag.toLowerCase())
              )
            );

            if (matchedEvidence) {
              await tx.insert(evidenceMappings).values({
                applicationId: newApp.id,
                jobRequirementId: req.id,
                projectEvidenceId: matchedEvidence.id,
                relevanceReason: `Auto-matched based on skill tags: ${matchedEvidence.skillTags?.join(", ")}`,
                isAiAssisted: false,
              });
            }
          }
        }
      }

      const [org] = await tx
        .select({ name: organisations.name })
        .from(organisations)
        .where(eq(organisations.id, job.organisationId));

      return {
        id: newApp.id,
        jobId: newApp.jobId,
        jobTitle: job.title,
        organisationName: org?.name || "Organization",
        status: newApp.status as ApplicationStatus,
        coverNote: newApp.coverNote,
        slaDeadline: newApp.slaDeadline ? newApp.slaDeadline.toISOString() : null,
        slaStatus: this.computeSlaStatus("APPLIED", newApp.slaDeadline),
        daysInCurrentStage: 0,
        createdAt: newApp.createdAt.toISOString(),
        updatedAt: newApp.updatedAt.toISOString(),
        history: [
          {
            id: "initial-history",
            applicationId: newApp.id,
            fromStatus: null,
            toStatus: "APPLIED" as const,
            changedBy: candidateUserId,
            reason: "Application submitted by candidate",
            createdAt: newApp.createdAt.toISOString(),
          },
        ],
      };
    });

    await auditService.recordEvent({
      eventType: "APPLICATION_SUBMITTED",
      actorId: candidateUserId,
      targetType: "APPLICATION",
      targetId: result.id,
      metadata: { jobId, status: "APPLIED" },
    });

    return result;
  }

  /**
   * Transitions an application's lifecycle status using strict state machine rules.
   */
  public static async transitionStatus(
    applicationId: string,
    orgId: string,
    userId: string,
    dto: UpdateApplicationStatusRequest,
    isPlatformAdmin = false
  ): Promise<ApplicationDetailDto> {
    await JobService.assertOrgAdmin(orgId, userId, isPlatformAdmin);

    const [app] = await db
      .select({
        application: applications,
        job: jobs,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(and(eq(applications.id, applicationId), eq(jobs.organisationId, orgId)));

    if (!app) {
      throw new NotFoundError("Application not found in this organization");
    }

    const currentStatus = app.application.status as ApplicationStatus;
    const targetStatus = dto.status;

    // State Machine Validation
    if (!isValidStatusTransition(currentStatus, targetStatus)) {
      throw new ConflictError(
        `Invalid status transition from '${currentStatus}' to '${targetStatus}'.`
      );
    }

    // Reopening Guard: If transitioning from REJECTED to SCREENING, reason is mandatory
    if (currentStatus === "REJECTED" && targetStatus === "SCREENING" && !dto.reason?.trim()) {
      throw new BadRequestError(
        "A formal justification reason is required when reopening a previously rejected application."
      );
    }

    // Determine new SLA deadline with monotonic bounding (prevent indefinite clock resetting)
    let newSlaDeadline: Date | null = null;
    if (targetStatus === "SCREENING" || targetStatus === "INTERVIEW") {
      const maxAllowedDeadline = new Date(
        app.application.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000
      );
      const proposedDeadline = new Date(Date.now() + SLA_DURATION_MS);
      newSlaDeadline =
        proposedDeadline > maxAllowedDeadline ? maxAllowedDeadline : proposedDeadline;
    }

    await db.transaction(async (tx) => {
      await tx
        .update(applications)
        .set({
          status: targetStatus,
          slaDeadline: newSlaDeadline,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, applicationId));

      await tx.insert(applicationStatusHistory).values({
        applicationId,
        fromStatus: currentStatus,
        toStatus: targetStatus,
        changedBy: userId,
        reason: dto.reason || `Status updated to ${targetStatus}`,
      });
    });

    await auditService.recordEvent({
      eventType: "APPLICATION_STATUS_CHANGED",
      actorId: userId,
      targetType: "APPLICATION",
      targetId: applicationId,
      metadata: { fromStatus: currentStatus, toStatus: targetStatus, reason: dto.reason },
    });

    return await this.getEmployerApplicationDetail(
      applicationId,
      orgId,
      userId,
      isPlatformAdmin
    );
  }

  /**
   * Candidate lists their submitted applications with transparent Anti-Ghosting SLA tracking.
   * INVARIANT: NO evaluation notes are EVER returned to candidates.
   */
  public static async getCandidateApplications(
    candidateUserId: string
  ): Promise<CandidateApplicationSummaryDto[]> {
    const candidateApps = await db
      .select({
        app: applications,
        jobTitle: jobs.title,
        orgName: organisations.name,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(organisations, eq(jobs.organisationId, organisations.id))
      .where(eq(applications.candidateId, candidateUserId))
      .orderBy(desc(applications.createdAt));

    const result: CandidateApplicationSummaryDto[] = [];

    for (const row of candidateApps) {
      const historyRows = await db
        .select()
        .from(applicationStatusHistory)
        .where(eq(applicationStatusHistory.applicationId, row.app.id))
        .orderBy(desc(applicationStatusHistory.createdAt));

      const historyDtos: ApplicationStatusHistoryDto[] = historyRows.map((h) => ({
        id: h.id,
        applicationId: h.applicationId,
        fromStatus: h.fromStatus as any,
        toStatus: h.toStatus as any,
        changedBy: h.changedBy,
        reason: h.reason,
        createdAt: h.createdAt.toISOString(),
      }));

      result.push({
        id: row.app.id,
        jobId: row.app.jobId,
        jobTitle: row.jobTitle,
        organisationName: row.orgName,
        status: row.app.status as ApplicationStatus,
        coverNote: row.app.coverNote,
        slaDeadline: row.app.slaDeadline ? row.app.slaDeadline.toISOString() : null,
        slaStatus: this.computeSlaStatus(
          row.app.status as ApplicationStatus,
          row.app.slaDeadline
        ),
        daysInCurrentStage: this.computeDaysInStage(row.app.updatedAt),
        createdAt: row.app.createdAt.toISOString(),
        updatedAt: row.app.updatedAt.toISOString(),
        history: historyDtos,
      });
    }

    return result;
  }

  /**
   * Employer lists applications for a specific job.
   */
  public static async getEmployerJobApplications(
    jobId: string,
    orgId: string,
    userId: string,
    isPlatformAdmin = false
  ) {
    await JobService.assertOrgMember(orgId, userId, isPlatformAdmin);

    const [job] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.organisationId, orgId)));

    if (!job) {
      throw new NotFoundError("Job not found in this organization");
    }

    const appRows = await db
      .select({
        app: applications,
        candidateName: users.fullName,
        candidateEmail: users.email,
        candidateProfileId: candidateProfiles.id,
      })
      .from(applications)
      .innerJoin(users, eq(applications.candidateId, users.id))
      .innerJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.createdAt));

    return appRows.map((row) => ({
      id: row.app.id,
      jobId: row.app.jobId,
      candidateId: row.app.candidateId,
      candidateName: row.candidateName,
      candidateEmail: row.candidateEmail,
      candidateProfileId: row.candidateProfileId,
      status: row.app.status as ApplicationStatus,
      slaDeadline: row.app.slaDeadline ? row.app.slaDeadline.toISOString() : null,
      slaStatus: this.computeSlaStatus(
        row.app.status as ApplicationStatus,
        row.app.slaDeadline
      ),
      daysInCurrentStage: this.computeDaysInStage(row.app.updatedAt),
      createdAt: row.app.createdAt.toISOString(),
      updatedAt: row.app.updatedAt.toISOString(),
    }));
  }

  /**
   * Employer fetches full application detail including candidate profile,
   * evidence mappings, timeline history, AND internal evaluation notes.
   */
  public static async getEmployerApplicationDetail(
    applicationId: string,
    orgId: string,
    userId: string,
    isPlatformAdmin = false
  ): Promise<ApplicationDetailDto> {
    await JobService.assertOrgMember(orgId, userId, isPlatformAdmin);

    const [row] = await db
      .select({
        app: applications,
        candidateName: users.fullName,
        candidateEmail: users.email,
        candidateProfileId: candidateProfiles.id,
        job: jobs,
        orgName: organisations.name,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(organisations, eq(jobs.organisationId, organisations.id))
      .innerJoin(users, eq(applications.candidateId, users.id))
      .innerJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
      .where(and(eq(applications.id, applicationId), eq(jobs.organisationId, orgId)));

    if (!row) {
      throw new NotFoundError("Application not found in this organization");
    }

    const jobDto = await JobService.getJobById(row.job.id, {
      id: userId,
      role: "EMPLOYER",
    } as any);

    // Fetch evidence mappings with linked project evidence
    const mappings = await db
      .select({
        mapping: evidenceMappings,
        req: jobRequirements,
        ev: projectEvidence,
      })
      .from(evidenceMappings)
      .innerJoin(jobRequirements, eq(evidenceMappings.jobRequirementId, jobRequirements.id))
      .leftJoin(projectEvidence, eq(evidenceMappings.projectEvidenceId, projectEvidence.id))
      .where(eq(evidenceMappings.applicationId, applicationId));

    const evidenceMappingDtos: EvidenceMappingDto[] = mappings.map((m) => ({
      id: m.mapping.id,
      applicationId: m.mapping.applicationId,
      jobRequirementId: m.mapping.jobRequirementId,
      projectEvidenceId: m.mapping.projectEvidenceId,
      requirementText: m.req.requirementText,
      importance: m.req.importance as any,
      evidenceTypeHint: m.req.evidenceTypeHint,
      relevanceScore: m.mapping.relevanceScore,
      relevanceReason: m.mapping.relevanceReason,
      isAiAssisted: m.mapping.isAiAssisted,
      computedAt: m.mapping.computedAt.toISOString(),
      evidence: m.ev
        ? {
            id: m.ev.id,
            projectId: m.ev.projectId,
            evidenceType: m.ev.evidenceType as any,
            title: m.ev.title,
            description: m.ev.description,
            url: m.ev.url,
            filePath: null, // Masked internal file paths
            personalContribution: m.ev.personalContribution,
            isSelfReported: m.ev.isSelfReported,
            skillTags: m.ev.skillTags,
            createdAt: m.ev.createdAt.toISOString(),
            updatedAt: m.ev.updatedAt.toISOString(),
          }
        : null,
    }));

    // Fetch history
    const historyRows = await db
      .select({
        h: applicationStatusHistory,
        changerName: users.fullName,
      })
      .from(applicationStatusHistory)
      .leftJoin(users, eq(applicationStatusHistory.changedBy, users.id))
      .where(eq(applicationStatusHistory.applicationId, applicationId))
      .orderBy(desc(applicationStatusHistory.createdAt));

    const historyDtos: ApplicationStatusHistoryDto[] = historyRows.map((h) => ({
      id: h.h.id,
      applicationId: h.h.applicationId,
      fromStatus: h.h.fromStatus as any,
      toStatus: h.h.toStatus as any,
      changedBy: h.h.changedBy,
      changedByName: h.changerName || undefined,
      reason: h.h.reason,
      createdAt: h.h.createdAt.toISOString(),
    }));

    // Fetch internal evaluation notes
    const notesRows = await db
      .select({
        note: evaluationNotes,
        authorName: users.fullName,
      })
      .from(evaluationNotes)
      .innerJoin(users, eq(evaluationNotes.authorId, users.id))
      .where(eq(evaluationNotes.applicationId, applicationId))
      .orderBy(desc(evaluationNotes.createdAt));

    const notesDtos: EvaluationNoteDto[] = notesRows.map((n) => ({
      id: n.note.id,
      applicationId: n.note.applicationId,
      authorId: n.note.authorId,
      authorName: n.authorName,
      content: n.note.content,
      isInternal: n.note.isInternal,
      createdAt: n.note.createdAt.toISOString(),
      updatedAt: n.note.updatedAt.toISOString(),
    }));

    return {
      id: row.app.id,
      jobId: row.app.jobId,
      candidateId: row.app.candidateId,
      candidateName: row.candidateName,
      candidateEmail: row.candidateEmail,
      candidateProfileId: row.candidateProfileId,
      status: row.app.status as ApplicationStatus,
      coverNote: row.app.coverNote,
      slaDeadline: row.app.slaDeadline ? row.app.slaDeadline.toISOString() : null,
      slaStatus: this.computeSlaStatus(
        row.app.status as ApplicationStatus,
        row.app.slaDeadline
      ),
      daysInCurrentStage: this.computeDaysInStage(row.app.updatedAt),
      createdAt: row.app.createdAt.toISOString(),
      updatedAt: row.app.updatedAt.toISOString(),
      job: jobDto,
      evidenceMappings: evidenceMappingDtos,
      history: historyDtos,
      evaluationNotes: notesDtos,
    };
  }

  /**
   * Adds an internal evaluation note to an application.
   */
  public static async addEvaluationNote(
    applicationId: string,
    orgId: string,
    userId: string,
    dto: CreateEvaluationNoteRequest,
    isPlatformAdmin = false
  ): Promise<EvaluationNoteDto> {
    await JobService.assertOrgMember(orgId, userId, isPlatformAdmin);

    const [app] = await db
      .select({ id: applications.id })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(and(eq(applications.id, applicationId), eq(jobs.organisationId, orgId)));

    if (!app) {
      throw new NotFoundError("Application not found in this organization");
    }

    const [author] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, userId));

    const [savedNote] = await db
      .insert(evaluationNotes)
      .values({
        applicationId,
        authorId: userId,
        content: dto.content,
        isInternal: dto.isInternal ?? true,
      })
      .returning();

    if (!savedNote) {
      throw new Error("Failed to save evaluation note");
    }

    return {
      id: savedNote.id,
      applicationId: savedNote.applicationId,
      authorId: savedNote.authorId,
      authorName: author?.fullName || "Reviewer",
      content: savedNote.content,
      isInternal: savedNote.isInternal,
      createdAt: savedNote.createdAt.toISOString(),
      updatedAt: savedNote.updatedAt.toISOString(),
    };
  }
}

import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  applications,
  jobs,
  jobRequirements,
  candidateProfiles,
  projects,
  projectEvidence,
  organisationMemberships,
  aiAssessments,
} from "../db/schema/index.js";
import { aiServiceClient, type EvidenceChunkInput } from "./aiServiceClient.js";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../errors/AppError.js";
import { auditService } from "./auditService.js";
import type {
  AiAssessmentDto,
  AssessApplicationResponseDto,
} from "@proofhire/shared-contracts";

export class AiAssessmentService {
  /**
   * Assesses candidate evidence against job rubric requirements for an application.
   * Strictly enforces employer organization authorization before processing.
   */
  async assessApplication(
    applicationId: string,
    reviewerUserId: string,
    targetRequirementId?: string
  ): Promise<AssessApplicationResponseDto> {
    // 1. Fetch application and job details
    const [appRecord] = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        candidateId: applications.candidateId,
        organisationId: jobs.organisationId,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.id, applicationId))
      .limit(1);

    if (!appRecord) {
      throw new NotFoundError("Application not found");
    }

    // 2. Authorize reviewer: Must be a member of the employer organization
    const [membership] = await db
      .select({ id: organisationMemberships.id })
      .from(organisationMemberships)
      .where(
        and(
          eq(organisationMemberships.organisationId, appRecord.organisationId),
          eq(organisationMemberships.userId, reviewerUserId)
        )
      )
      .limit(1);

    if (!membership) {
      throw new ForbiddenError("You do not have permission to evaluate applications for this organization");
    }

    // 3. Fetch Job Requirements
    let requirementsQuery = db
      .select()
      .from(jobRequirements)
      .where(eq(jobRequirements.jobId, appRecord.jobId));

    const requirements = await requirementsQuery;
    if (requirements.length === 0) {
      throw new ValidationError("Job has no structured rubric requirements to assess");
    }

    const filteredRequirements = targetRequirementId
      ? requirements.filter((r) => r.id === targetRequirementId)
      : requirements;

    if (filteredRequirements.length === 0) {
      throw new NotFoundError("Specified requirement not found on this job");
    }

    // 4. Gather Candidate Evidence Chunks
    const candidateProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.candidateId, appRecord.candidateId));

    const candidateEvidenceItems = await db
      .select()
      .from(projectEvidence)
      .innerJoin(projects, eq(projectEvidence.projectId, projects.id))
      .where(eq(projects.candidateId, appRecord.candidateId));

    const [candidateProfile] = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.id, appRecord.candidateId))
      .limit(1);

    const evidenceChunks: EvidenceChunkInput[] = [];

    // Add candidate profile bio as context chunk if available
    if (candidateProfile?.bio) {
      evidenceChunks.push({
        id: `profile-${candidateProfile.id}`,
        title: "Candidate Profile Summary",
        text: candidateProfile.bio,
        isSelfReported: true,
      });
    }

    // Add projects
    for (const proj of candidateProjects) {
      const textParts = [
        proj.description,
        proj.personalContribution ? `Personal Contribution: ${proj.personalContribution}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      evidenceChunks.push({
        id: `proj-${proj.id}`,
        title: `Project: ${proj.name}`,
        text: textParts,
        sourceUrl: proj.githubUrl || proj.projectUrl || proj.demoUrl || undefined,
        isSelfReported: true,
      });
    }

    // Add specific evidence items
    for (const { project_evidence: ev } of candidateEvidenceItems) {
      evidenceChunks.push({
        id: `ev-${ev.id}`,
        title: ev.title,
        text: `${ev.description || ""} ${ev.personalContribution ? `Contribution: ${ev.personalContribution}` : ""}`,
        sourceUrl: ev.url || ev.filePath || undefined,
        isSelfReported: ev.isSelfReported,
      });
    }

    // 5. Run AI Assessments per requirement
    const results: AiAssessmentDto[] = [];

    for (const req of filteredRequirements) {
      const aiResult = await aiServiceClient.generateExplanation(
        req.requirementText,
        evidenceChunks
      );

      // Persist or update assessment in DB
      const [saved] = await db
        .insert(aiAssessments)
        .values({
          applicationId,
          requirementId: req.id,
          supportLevel: aiResult.supportLevel,
          confidence: aiResult.confidence,
          citations: aiResult.citations,
          limitations: aiResult.limitations,
          advisoryNotes: aiResult.advisoryNotes,
          isSelfReported: aiResult.isSelfReported,
          securityWarnings: aiResult.securityWarnings,
        })
        .returning();

      if (saved) {
        results.push({
          id: saved.id,
          applicationId: saved.applicationId,
          requirementId: saved.requirementId,
          supportLevel: saved.supportLevel as any,
          confidence: saved.confidence,
          citations: saved.citations as string[],
          limitations: saved.limitations as string[],
          advisoryNotes: saved.advisoryNotes,
          isSelfReported: saved.isSelfReported,
          securityWarnings: saved.securityWarnings as string[],
          rule7Disclaimer:
            "Advisory Only: AI provides grounded citations to assist evaluation. Final hiring decisions are made exclusively by human reviewers.",
          createdAt: saved.createdAt.toISOString(),
        });
      }
    }

    await auditService.recordEvent({
      eventType: "AI_ASSESSMENT_TRIGGERED",
      actorId: reviewerUserId,
      targetType: "APPLICATION",
      targetId: applicationId,
      metadata: { count: results.length },
    });

    return {
      assessments: results,
      status: "SUCCESS",
      message: `Generated AI assessments for ${results.length} rubric requirement(s).`,
    };
  }

  /**
   * Retrieves previously computed AI assessments for an application.
   */
  async getApplicationAssessments(
    applicationId: string,
    reviewerUserId: string
  ): Promise<AiAssessmentDto[]> {
    const [appRecord] = await db
      .select({
        id: applications.id,
        organisationId: jobs.organisationId,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.id, applicationId))
      .limit(1);

    if (!appRecord) {
      throw new NotFoundError("Application not found");
    }

    // Check employer membership
    const [membership] = await db
      .select({ id: organisationMemberships.id })
      .from(organisationMemberships)
      .where(
        and(
          eq(organisationMemberships.organisationId, appRecord.organisationId),
          eq(organisationMemberships.userId, reviewerUserId)
        )
      )
      .limit(1);

    if (!membership) {
      throw new ForbiddenError("You do not have permission to view assessments for this organization");
    }

    const records = await db
      .select()
      .from(aiAssessments)
      .where(eq(aiAssessments.applicationId, applicationId));

    return records.map((r) => ({
      id: r.id,
      applicationId: r.applicationId,
      requirementId: r.requirementId,
      supportLevel: r.supportLevel as any,
      confidence: r.confidence,
      citations: r.citations as string[],
      limitations: r.limitations as string[],
      advisoryNotes: r.advisoryNotes,
      isSelfReported: r.isSelfReported,
      securityWarnings: r.securityWarnings as string[],
      rule7Disclaimer:
        "Advisory Only: AI provides grounded citations to assist evaluation. Final hiring decisions are made exclusively by human reviewers.",
      createdAt: r.createdAt.toISOString(),
    }));
  }
}

export const aiAssessmentService = new AiAssessmentService();

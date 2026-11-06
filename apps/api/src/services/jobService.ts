import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  jobs,
  jobRequirements,
  organisations,
  organisationMemberships,
  applications,
} from "../db/schema/index.js";
import { NotFoundError, ForbiddenError } from "../errors/AppError.js";
import { auditService } from "./auditService.js";
import type {
  CreateJobRequest,
  UpdateJobRequest,
  JobDto,
  JobSearchQuery,
  AuthUser,
} from "@proofhire/shared-contracts";

export class JobService {
  /**
   * Asserts employer has OWNER or ADMIN role in the organisation.
   */
  public static async assertOrgAdmin(
    orgId: string,
    userId: string,
    isPlatformAdmin = false
  ) {
    if (isPlatformAdmin) return;

    const [membership] = await db
      .select()
      .from(organisationMemberships)
      .where(
        and(
          eq(organisationMemberships.organisationId, orgId),
          eq(organisationMemberships.userId, userId)
        )
      );

    if (!membership || (membership.orgRole !== "OWNER" && membership.orgRole !== "ADMIN")) {
      throw new ForbiddenError(
        "Only organization Owners and Admins can create or modify jobs"
      );
    }
  }

  /**
   * Asserts employer has at least MEMBER role in the organisation.
   */
  public static async assertOrgMember(
    orgId: string,
    userId: string,
    isPlatformAdmin = false
  ) {
    if (isPlatformAdmin) return;

    const [membership] = await db
      .select()
      .from(organisationMemberships)
      .where(
        and(
          eq(organisationMemberships.organisationId, orgId),
          eq(organisationMemberships.userId, userId)
        )
      );

    if (!membership) {
      throw new ForbiddenError("You do not have access to this organization");
    }
  }

  /**
   * Creates a new job with requirements (rubrics) in DRAFT state.
   */
  public static async createJob(
    orgId: string,
    userId: string,
    dto: CreateJobRequest,
    isPlatformAdmin = false
  ): Promise<JobDto> {
    await this.assertOrgAdmin(orgId, userId, isPlatformAdmin);

    const [org] = await db
      .select({ name: organisations.name, slug: organisations.slug })
      .from(organisations)
      .where(eq(organisations.id, orgId));

    if (!org) {
      throw new NotFoundError("Organization not found");
    }

    return await db.transaction(async (tx) => {
      const [newJob] = await tx
        .insert(jobs)
        .values({
          organisationId: orgId,
          createdBy: userId,
          title: dto.title,
          description: dto.description,
          employmentType: dto.employmentType,
          locationCity: dto.locationCity || null,
          locationCountry: dto.locationCountry || null,
          remoteType: dto.remoteType,
          salaryMin: dto.salaryMin || null,
          salaryMax: dto.salaryMax || null,
          salaryCurrency: dto.salaryCurrency || "INR",
          applicationDeadline: dto.applicationDeadline || null,
          status: "DRAFT",
        })
        .returning();

      if (!newJob) {
        throw new Error("Failed to create job record");
      }

      // Insert requirements if provided
      const requirements: Array<typeof jobRequirements.$inferSelect> = [];
      if (dto.requirements && dto.requirements.length > 0) {
        for (let i = 0; i < dto.requirements.length; i++) {
          const req = dto.requirements[i];
          if (!req) continue;
          const [savedReq] = await tx
            .insert(jobRequirements)
            .values({
              jobId: newJob.id,
              requirementText: req.requirementText,
              importance: req.importance,
              evidenceTypeHint: req.evidenceTypeHint || null,
              skillTags: req.skillTags || [],
              sortOrder: req.sortOrder ?? i,
            })
            .returning();
          if (savedReq) {
            requirements.push(savedReq);
          }
        }
      }

      return {
        id: newJob.id,
        organisationId: newJob.organisationId,
        organisationName: org.name,
        organisationSlug: org.slug,
        createdBy: newJob.createdBy,
        title: newJob.title,
        description: newJob.description,
        employmentType: newJob.employmentType as any,
        locationCity: newJob.locationCity,
        locationCountry: newJob.locationCountry,
        remoteType: newJob.remoteType as any,
        salaryMin: newJob.salaryMin,
        salaryMax: newJob.salaryMax,
        salaryCurrency: newJob.salaryCurrency,
        applicationDeadline: newJob.applicationDeadline,
        status: newJob.status as any,
        publishedAt: newJob.publishedAt ? newJob.publishedAt.toISOString() : null,
        closedAt: newJob.closedAt ? newJob.closedAt.toISOString() : null,
        requirements: requirements.map((r) => ({
          id: r.id,
          jobId: r.jobId,
          requirementText: r.requirementText,
          importance: r.importance as any,
          evidenceTypeHint: r.evidenceTypeHint,
          skillTags: r.skillTags,
          sortOrder: r.sortOrder,
          createdAt: r.createdAt.toISOString(),
        })),
        applicationCount: 0,
        createdAt: newJob.createdAt.toISOString(),
        updatedAt: newJob.updatedAt.toISOString(),
      };
    });
  }

  /**
   * Retrieves all jobs for an organization (DRAFT, PUBLISHED, CLOSED).
   */
  public static async getOrganizationJobs(
    orgId: string,
    userId: string,
    isPlatformAdmin = false
  ): Promise<JobDto[]> {
    await this.assertOrgMember(orgId, userId, isPlatformAdmin);

    const [org] = await db
      .select({ name: organisations.name, slug: organisations.slug })
      .from(organisations)
      .where(eq(organisations.id, orgId));

    if (!org) {
      throw new NotFoundError("Organization not found");
    }

    const orgJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.organisationId, orgId))
      .orderBy(desc(jobs.createdAt));

    const result: JobDto[] = [];

    for (const j of orgJobs) {
      const reqs = await db
        .select()
        .from(jobRequirements)
        .where(eq(jobRequirements.jobId, j.id))
        .orderBy(jobRequirements.sortOrder);

      const [appCountRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(applications)
        .where(eq(applications.jobId, j.id));

      result.push({
        id: j.id,
        organisationId: j.organisationId,
        organisationName: org.name,
        organisationSlug: org.slug,
        createdBy: j.createdBy,
        title: j.title,
        description: j.description,
        employmentType: j.employmentType as any,
        locationCity: j.locationCity,
        locationCountry: j.locationCountry,
        remoteType: j.remoteType as any,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        salaryCurrency: j.salaryCurrency,
        applicationDeadline: j.applicationDeadline,
        status: j.status as any,
        publishedAt: j.publishedAt ? j.publishedAt.toISOString() : null,
        closedAt: j.closedAt ? j.closedAt.toISOString() : null,
        requirements: reqs.map((r) => ({
          id: r.id,
          jobId: r.jobId,
          requirementText: r.requirementText,
          importance: r.importance as any,
          evidenceTypeHint: r.evidenceTypeHint,
          skillTags: r.skillTags,
          sortOrder: r.sortOrder,
          createdAt: r.createdAt.toISOString(),
        })),
        applicationCount: appCountRow?.count || 0,
        createdAt: j.createdAt.toISOString(),
        updatedAt: j.updatedAt.toISOString(),
      });
    }

    return result;
  }

  /**
   * Retrieves a single job by ID.
   * If not PUBLISHED, enforces organization-level access.
   */
  public static async getJobById(
    jobId: string,
    requestingUser?: AuthUser
  ): Promise<JobDto> {
    const [j] = await db.select().from(jobs).where(eq(jobs.id, jobId));

    if (!j) {
      throw new NotFoundError("Job not found");
    }

    const [org] = await db
      .select({ name: organisations.name, slug: organisations.slug })
      .from(organisations)
      .where(eq(organisations.id, j.organisationId));

    // Visibility Guard: If not published, only owning org members or admins can view
    if (j.status !== "PUBLISHED") {
      if (!requestingUser) {
        throw new NotFoundError("Job not found");
      }
      if (requestingUser.role !== "ADMIN") {
        await this.assertOrgMember(j.organisationId, requestingUser.id);
      }
    }

    const reqs = await db
      .select()
      .from(jobRequirements)
      .where(eq(jobRequirements.jobId, j.id))
      .orderBy(jobRequirements.sortOrder);

    const [appCountRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(applications)
      .where(eq(applications.jobId, j.id));

    return {
      id: j.id,
      organisationId: j.organisationId,
      organisationName: org?.name,
      organisationSlug: org?.slug,
      createdBy: j.createdBy,
      title: j.title,
      description: j.description,
      employmentType: j.employmentType as any,
      locationCity: j.locationCity,
      locationCountry: j.locationCountry,
      remoteType: j.remoteType as any,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      salaryCurrency: j.salaryCurrency,
      applicationDeadline: j.applicationDeadline,
      status: j.status as any,
      publishedAt: j.publishedAt ? j.publishedAt.toISOString() : null,
      closedAt: j.closedAt ? j.closedAt.toISOString() : null,
      requirements: reqs.map((r) => ({
        id: r.id,
        jobId: r.jobId,
        requirementText: r.requirementText,
        importance: r.importance as any,
        evidenceTypeHint: r.evidenceTypeHint,
        skillTags: r.skillTags,
        sortOrder: r.sortOrder,
        createdAt: r.createdAt.toISOString(),
      })),
      applicationCount: appCountRow?.count || 0,
      createdAt: j.createdAt.toISOString(),
      updatedAt: j.updatedAt.toISOString(),
    };
  }

  /**
   * Updates an existing job and its requirements.
   */
  public static async updateJob(
    jobId: string,
    orgId: string,
    userId: string,
    dto: UpdateJobRequest,
    isPlatformAdmin = false
  ): Promise<JobDto> {
    await this.assertOrgAdmin(orgId, userId, isPlatformAdmin);

    const [existing] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.organisationId, orgId)));

    if (!existing) {
      throw new NotFoundError("Job not found in this organization");
    }

    const updateFields: any = {
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) updateFields.title = dto.title;
    if (dto.description !== undefined) updateFields.description = dto.description;
    if (dto.employmentType !== undefined) updateFields.employmentType = dto.employmentType;
    if (dto.locationCity !== undefined) updateFields.locationCity = dto.locationCity;
    if (dto.locationCountry !== undefined) updateFields.locationCountry = dto.locationCountry;
    if (dto.remoteType !== undefined) updateFields.remoteType = dto.remoteType;
    if (dto.salaryMin !== undefined) updateFields.salaryMin = dto.salaryMin;
    if (dto.salaryMax !== undefined) updateFields.salaryMax = dto.salaryMax;
    if (dto.salaryCurrency !== undefined) updateFields.salaryCurrency = dto.salaryCurrency;
    if (dto.applicationDeadline !== undefined)
      updateFields.applicationDeadline = dto.applicationDeadline;

    if (dto.status !== undefined) {
      updateFields.status = dto.status;
      if (dto.status === "PUBLISHED" && !existing.publishedAt) {
        updateFields.publishedAt = new Date();
      }
      if (dto.status === "CLOSED" && !existing.closedAt) {
        updateFields.closedAt = new Date();
      }
    }

    await db.transaction(async (tx) => {
      await tx.update(jobs).set(updateFields).where(eq(jobs.id, jobId));

      // If new requirements provided, replace them
      if (dto.requirements !== undefined) {
        await tx.delete(jobRequirements).where(eq(jobRequirements.jobId, jobId));

        for (let i = 0; i < dto.requirements.length; i++) {
          const r = dto.requirements[i];
          if (!r) continue;
          await tx.insert(jobRequirements).values({
            jobId,
            requirementText: r.requirementText,
            importance: r.importance,
            evidenceTypeHint: r.evidenceTypeHint || null,
            skillTags: r.skillTags || [],
            sortOrder: r.sortOrder ?? i,
          });
        }
      }
    });

    if (dto.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      await auditService.recordEvent({
        eventType: "JOB_PUBLISHED",
        actorId: userId,
        targetType: "JOB",
        targetId: jobId,
        metadata: { organisationId: orgId, title: dto.title || existing.title },
      });
    } else if (dto.status === "CLOSED" && existing.status !== "CLOSED") {
      await auditService.recordEvent({
        eventType: "JOB_CLOSED",
        actorId: userId,
        targetType: "JOB",
        targetId: jobId,
        metadata: { organisationId: orgId, title: dto.title || existing.title },
      });
    }

    return await this.getJobById(jobId, { id: userId, role: "EMPLOYER" } as AuthUser);
  }

  /**
   * Public Search & Discovery for published jobs.
   */
  public static async searchPublishedJobs(
    query: JobSearchQuery
  ): Promise<{ jobs: JobDto[]; total: number; page: number; limit: number }> {
    const conditions = [eq(jobs.status, "PUBLISHED")];

    if (query.keyword) {
      const kw = `%${query.keyword}%`;
      conditions.push(or(ilike(jobs.title, kw), ilike(jobs.description, kw))!);
    }

    if (query.employmentType) {
      conditions.push(eq(jobs.employmentType, query.employmentType));
    }

    if (query.remoteType) {
      conditions.push(eq(jobs.remoteType, query.remoteType));
    }

    if (query.location) {
      const loc = `%${query.location}%`;
      conditions.push(or(ilike(jobs.locationCity, loc), ilike(jobs.locationCountry, loc))!);
    }

    const whereClause = and(...conditions);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const [totalRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobs)
      .where(whereClause);

    const matchingJobs = await db
      .select({
        job: jobs,
        orgName: organisations.name,
        orgSlug: organisations.slug,
      })
      .from(jobs)
      .innerJoin(organisations, eq(jobs.organisationId, organisations.id))
      .where(whereClause)
      .orderBy(desc(jobs.publishedAt), desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);

    const result: JobDto[] = [];

    for (const row of matchingJobs) {
      const reqs = await db
        .select()
        .from(jobRequirements)
        .where(eq(jobRequirements.jobId, row.job.id))
        .orderBy(jobRequirements.sortOrder);

      result.push({
        id: row.job.id,
        organisationId: row.job.organisationId,
        organisationName: row.orgName,
        organisationSlug: row.orgSlug,
        createdBy: row.job.createdBy,
        title: row.job.title,
        description: row.job.description,
        employmentType: row.job.employmentType as any,
        locationCity: row.job.locationCity,
        locationCountry: row.job.locationCountry,
        remoteType: row.job.remoteType as any,
        salaryMin: row.job.salaryMin,
        salaryMax: row.job.salaryMax,
        salaryCurrency: row.job.salaryCurrency,
        applicationDeadline: row.job.applicationDeadline,
        status: row.job.status as any,
        publishedAt: row.job.publishedAt ? row.job.publishedAt.toISOString() : null,
        closedAt: row.job.closedAt ? row.job.closedAt.toISOString() : null,
        requirements: reqs.map((r) => ({
          id: r.id,
          jobId: r.jobId,
          requirementText: r.requirementText,
          importance: r.importance as any,
          evidenceTypeHint: r.evidenceTypeHint,
          skillTags: r.skillTags,
          sortOrder: r.sortOrder,
          createdAt: r.createdAt.toISOString(),
        })),
        createdAt: row.job.createdAt.toISOString(),
        updatedAt: row.job.updatedAt.toISOString(),
      });
    }

    return {
      jobs: result,
      total: totalRow?.count || 0,
      page,
      limit,
    };
  }
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { SessionService } from "../services/sessionService.js";
import { JobService } from "../services/jobService.js";
import type { AuthUser, JobDto } from "@proofhire/shared-contracts";

describe("Jobs and Requirements (Rubrics) API Routes", () => {
  const app = createApp();

  const employerUser: AuthUser = {
    id: "employer-user-1",
    email: "recruiter@acme.dev",
    fullName: "Rachel Recruiter",
    role: "EMPLOYER",
    emailVerified: true,
    accountStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
    organizations: [{ id: "org-1", name: "Acme Corp", slug: "acme-corp", role: "OWNER" }],
  };

  const candidateUser: AuthUser = {
    id: "candidate-user-1",
    email: "alex@proofhire.dev",
    fullName: "Alex Engineer",
    role: "CANDIDATE",
    emailVerified: true,
    accountStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
    candidateProfileId: "cand-profile-1",
    organizations: [],
  };

  const validCsrfToken = "valid_csrf_token_test_1234567890abcdef";

  function setupAuth(user: AuthUser) {
    vi.spyOn(SessionService, "validateSession").mockResolvedValue({
      session: {
        id: "sess-1",
        userId: user.id,
        tokenHash: "hash",
        expiresAt: new Date(Date.now() + 3600000),
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(),
      },
      user,
    });
  }

  const mockJobDto: JobDto = {
    id: "job-1-uuid",
    organisationId: "org-1",
    organisationName: "Acme Corp",
    organisationSlug: "acme-corp",
    createdBy: employerUser.id,
    title: "Junior Systems Engineer",
    description: "Build robust distributed backend systems in Go and TypeScript.",
    employmentType: "FULL_TIME",
    locationCity: "Bengaluru",
    locationCountry: "India",
    remoteType: "REMOTE",
    salaryMin: 800000,
    salaryMax: 1400000,
    salaryCurrency: "INR",
    applicationDeadline: "2026-12-31",
    status: "PUBLISHED",
    publishedAt: new Date().toISOString(),
    closedAt: null,
    requirements: [
      {
        id: "req-1",
        jobId: "job-1-uuid",
        requirementText: "Practical knowledge of relational database schema design",
        importance: "REQUIRED",
        evidenceTypeHint: "Link to schema migration or PR",
        skillTags: ["PostgreSQL", "SQL"],
        sortOrder: 0,
        createdAt: new Date().toISOString(),
      },
    ],
    applicationCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/v1/jobs (Public Search & Discovery)", () => {
    it("returns published jobs matching search criteria without requiring authentication", async () => {
      vi.spyOn(JobService, "searchPublishedJobs").mockResolvedValue({
        jobs: [mockJobDto],
        total: 1,
        page: 1,
        limit: 20,
      });

      const res = await request(app)
        .get("/api/v1/jobs")
        .query({ keyword: "Systems", remoteType: "REMOTE" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("Junior Systems Engineer");
      expect(res.body.meta.total).toBe(1);
    });
  });

  describe("GET /api/v1/jobs/:jobId (Single Job View)", () => {
    it("returns published job with rubric requirements to public visitors", async () => {
      vi.spyOn(JobService, "getJobById").mockResolvedValue(mockJobDto);

      const res = await request(app).get("/api/v1/jobs/job-1-uuid");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe("job-1-uuid");
      expect(res.body.data.requirements).toHaveLength(1);
      expect(res.body.data.requirements[0].importance).toBe("REQUIRED");
    });
  });

  describe("POST /api/v1/organisations/:orgId/jobs (Employer Job Creation)", () => {
    it("rejects candidate users from creating jobs with 403 Forbidden", async () => {
      setupAuth(candidateUser);

      const res = await request(app)
        .post("/api/v1/organisations/org-1/jobs")
        .set("Cookie", [`proofhire_session=session_token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken)
        .send({
          title: "Senior SRE",
          description: "Maintain cloud infrastructure and kubernetes clusters.",
          employmentType: "FULL_TIME",
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("creates job in DRAFT state with structured requirements for authorized employer", async () => {
      setupAuth(employerUser);

      const draftJob: JobDto = {
        ...mockJobDto,
        status: "DRAFT",
        publishedAt: null,
      };

      vi.spyOn(JobService, "createJob").mockResolvedValue(draftJob);

      const res = await request(app)
        .post("/api/v1/organisations/org-1/jobs")
        .set("Cookie", [`proofhire_session=session_token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken)
        .send({
          title: "Junior Systems Engineer",
          description: "Build robust distributed backend systems in Go and TypeScript.",
          employmentType: "FULL_TIME",
          remoteType: "REMOTE",
          requirements: [
            {
              requirementText: "Practical knowledge of relational database schema design",
              importance: "REQUIRED",
              evidenceTypeHint: "Link to schema migration or PR",
              skillTags: ["PostgreSQL", "SQL"],
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("DRAFT");
      expect(res.body.data.title).toBe("Junior Systems Engineer");
    });
  });

  describe("GET /api/v1/organisations/:orgId/jobs (Employer Org Jobs List)", () => {
    it("returns all organization jobs (drafts, published, closed) for employer", async () => {
      setupAuth(employerUser);

      vi.spyOn(JobService, "getOrganizationJobs").mockResolvedValue([mockJobDto]);

      const res = await request(app)
        .get("/api/v1/organisations/org-1/jobs")
        .set("Cookie", [`proofhire_session=session_token`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].requirements).toHaveLength(1);
    });
  });

  describe("PATCH /api/v1/organisations/:orgId/jobs/:jobId (Job Updates & Publishing)", () => {
    it("publishes a draft job and updates requirement criteria", async () => {
      setupAuth(employerUser);

      const publishedJob: JobDto = {
        ...mockJobDto,
        status: "PUBLISHED",
        publishedAt: new Date().toISOString(),
      };

      vi.spyOn(JobService, "updateJob").mockResolvedValue(publishedJob);

      const res = await request(app)
        .patch("/api/v1/organisations/org-1/jobs/job-1-uuid")
        .set("Cookie", [`proofhire_session=session_token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken)
        .send({
          status: "PUBLISHED",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("PUBLISHED");
      expect(res.body.data.publishedAt).not.toBeNull();
    });
  });
});

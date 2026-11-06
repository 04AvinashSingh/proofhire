import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { SessionService } from "../services/sessionService.js";
import { ApplicationService } from "../services/applicationService.js";
import { ConflictError, BadRequestError } from "../errors/AppError.js";
import type {
  AuthUser,
  CandidateApplicationSummaryDto,
  ApplicationDetailDto,
  EvaluationNoteDto,
} from "@proofhire/shared-contracts";

describe("Application Lifecycle & Anti-Ghosting SLA Routes", () => {
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

  const mockCandidateAppSummary: CandidateApplicationSummaryDto = {
    id: "app-1-uuid",
    jobId: "job-1-uuid",
    jobTitle: "Junior Systems Engineer",
    organisationName: "Acme Corp",
    status: "APPLIED",
    coverNote: "I have built a Raft consensus engine in TypeScript and look forward to contributing.",
    slaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    slaStatus: "ON_TRACK",
    daysInCurrentStage: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      {
        id: "hist-1",
        applicationId: "app-1-uuid",
        fromStatus: null,
        toStatus: "APPLIED",
        changedBy: candidateUser.id,
        reason: "Application submitted",
        createdAt: new Date().toISOString(),
      },
    ],
  };

  const mockAppDetail: ApplicationDetailDto = {
    id: "app-1-uuid",
    jobId: "job-1-uuid",
    candidateId: candidateUser.id,
    candidateName: candidateUser.fullName,
    candidateEmail: candidateUser.email,
    candidateProfileId: "cand-profile-1",
    status: "APPLIED",
    coverNote: "I have built a Raft consensus engine in TypeScript.",
    slaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    slaStatus: "ON_TRACK",
    daysInCurrentStage: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    job: {
      id: "job-1-uuid",
      organisationId: "org-1",
      organisationName: "Acme Corp",
      organisationSlug: "acme-corp",
      createdBy: employerUser.id,
      title: "Junior Systems Engineer",
      description: "Build robust distributed backend systems.",
      employmentType: "FULL_TIME",
      locationCity: "Bengaluru",
      locationCountry: "India",
      remoteType: "REMOTE",
      salaryMin: 800000,
      salaryMax: 1400000,
      salaryCurrency: "INR",
      applicationDeadline: null,
      status: "PUBLISHED",
      publishedAt: new Date().toISOString(),
      closedAt: null,
      requirements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    evidenceMappings: [
      {
        id: "map-1",
        applicationId: "app-1-uuid",
        jobRequirementId: "req-1",
        projectEvidenceId: "ev-1",
        requirementText: "Relational database schema design",
        importance: "REQUIRED",
        relevanceScore: "1.0",
        relevanceReason: "Candidate provided schema migration files",
        isAiAssisted: false,
        computedAt: new Date().toISOString(),
      },
    ],
    history: [
      {
        id: "hist-1",
        applicationId: "app-1-uuid",
        fromStatus: null,
        toStatus: "APPLIED",
        changedBy: candidateUser.id,
        reason: "Application submitted",
        createdAt: new Date().toISOString(),
      },
    ],
    evaluationNotes: [
      {
        id: "note-1",
        applicationId: "app-1-uuid",
        authorId: employerUser.id,
        authorName: employerUser.fullName,
        content: "Strong project evidence for database schema and Raft algorithm.",
        isInternal: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/v1/jobs/:jobId/apply (Candidate Application)", () => {
    it("allows a candidate to apply with cover note and evidence links", async () => {
      setupAuth(candidateUser);

      vi.spyOn(ApplicationService, "applyToJob").mockResolvedValue(mockCandidateAppSummary);

      const res = await request(app)
        .post("/api/v1/jobs/job-1-uuid/apply")
        .set("Cookie", [`proofhire_session=session_token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken)
        .send({
          coverNote: "I have built a Raft consensus engine in TypeScript and look forward to contributing.",
          evidenceMappings: [
            {
              jobRequirementId: "8c3d9a15-5e2b-4c7a-9f1e-8a7b6c5d4e3f",
              projectEvidenceId: "9c3d9a15-5e2b-4c7a-9f1e-8a7b6c5d4e3f",
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("APPLIED");
      expect(res.body.data.slaStatus).toBe("ON_TRACK");
      expect(res.body.data.slaDeadline).not.toBeNull();
    });

    it("rejects duplicate application with 409 Conflict", async () => {
      setupAuth(candidateUser);

      vi.spyOn(ApplicationService, "applyToJob").mockRejectedValue(
        new ConflictError("You have already submitted an application for this position")
      );

      const res = await request(app)
        .post("/api/v1/jobs/job-1-uuid/apply")
        .set("Cookie", [`proofhire_session=session_token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken)
        .send({
          coverNote: "Applying again",
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CONFLICT");
      expect(res.body.error.message).toContain("already submitted");
    });
  });

  describe("GET /api/v1/candidates/applications (Candidate Application Tracker)", () => {
    it("returns candidate applications with SLA and timeline but NO evaluation notes", async () => {
      setupAuth(candidateUser);

      vi.spyOn(ApplicationService, "getCandidateApplications").mockResolvedValue([
        mockCandidateAppSummary,
      ]);

      const res = await request(app)
        .get("/api/v1/candidates/applications")
        .set("Cookie", [`proofhire_session=session_token`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe("APPLIED");
      expect(res.body.data[0].slaStatus).toBe("ON_TRACK");

      // Verify invariant: No evaluation notes in response
      expect(res.body.data[0].evaluationNotes).toBeUndefined();
    });
  });

  describe("Application State Machine & Employer Review", () => {
    it("allows employer to transition application from APPLIED to SCREENING", async () => {
      setupAuth(employerUser);

      const screeningApp: ApplicationDetailDto = {
        ...mockAppDetail,
        status: "SCREENING",
      };

      vi.spyOn(ApplicationService, "transitionStatus").mockResolvedValue(screeningApp);

      const res = await request(app)
        .patch("/api/v1/organisations/org-1/applications/app-1-uuid/status")
        .set("Cookie", [`proofhire_session=session_token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken)
        .send({
          status: "SCREENING",
          reason: "Passed initial code evidence inspection",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("SCREENING");
    });

    it("rejects invalid state machine transition with 409 Conflict (e.g. APPLIED -> OFFER)", async () => {
      setupAuth(employerUser);

      vi.spyOn(ApplicationService, "transitionStatus").mockRejectedValue(
        new ConflictError("Invalid status transition from 'APPLIED' to 'OFFER'.")
      );

      const res = await request(app)
        .patch("/api/v1/organisations/org-1/applications/app-1-uuid/status")
        .set("Cookie", [`proofhire_session=session_token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken)
        .send({
          status: "OFFER",
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CONFLICT");
      expect(res.body.error.message).toContain("Invalid status transition");
    });

    it("rejects reopening from REJECTED to SCREENING without justification reason", async () => {
      setupAuth(employerUser);

      vi.spyOn(ApplicationService, "transitionStatus").mockRejectedValue(
        new BadRequestError("A formal justification reason is required when reopening a previously rejected application.")
      );

      const res = await request(app)
        .patch("/api/v1/organisations/org-1/applications/app-1-uuid/status")
        .set("Cookie", [`proofhire_session=session_token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken)
        .send({
          status: "SCREENING",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("BAD_REQUEST");
      expect(res.body.error.message).toContain("reopening");
    });
  });

  describe("Employer Private Evaluation Notes (Candidate Isolation)", () => {
    it("allows employer to record internal evaluation note", async () => {
      setupAuth(employerUser);

      const mockNote: EvaluationNoteDto = {
        id: "note-1",
        applicationId: "app-1-uuid",
        authorId: employerUser.id,
        authorName: employerUser.fullName,
        content: "Candidate has demonstrated deep understanding of distributed consensus in PR review.",
        isInternal: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.spyOn(ApplicationService, "addEvaluationNote").mockResolvedValue(mockNote);

      const res = await request(app)
        .post("/api/v1/organisations/org-1/applications/app-1-uuid/notes")
        .set("Cookie", [`proofhire_session=session_token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken)
        .send({
          content: "Candidate has demonstrated deep understanding of distributed consensus in PR review.",
          isInternal: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toContain("distributed consensus");
      expect(res.body.data.isInternal).toBe(true);
    });

    it("strictly blocks candidates from creating evaluation notes with 403 Forbidden", async () => {
      setupAuth(candidateUser);

      const res = await request(app)
        .post("/api/v1/organisations/org-1/applications/app-1-uuid/notes")
        .set("Cookie", [`proofhire_session=session_token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken)
        .send({
          content: "Attempting to write private note as candidate",
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });
  });
});

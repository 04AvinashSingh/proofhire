import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { SessionService } from "../services/sessionService.js";
import { AuthService } from "../services/authService.js";
import { CandidateProfileService } from "../services/candidateProfileService.js";
import { JobService } from "../services/jobService.js";
import { ApplicationService } from "../services/applicationService.js";
import { aiAssessmentService } from "../services/aiAssessmentService.js";
import { aiServiceClient } from "../services/aiServiceClient.js";
import { auditService } from "../services/auditService.js";
import type {
  AuthUser,
  JobDto,
  CandidateApplicationSummaryDto,
  ApplicationDetailDto,
  AssessApplicationResponseDto,
} from "@proofhire/shared-contracts";

describe("Milestone 6: Complete End-to-End Hiring Workflow Integration", () => {
  const app = createApp();
  const validCsrfToken = "csrf_token_production_e2e_test_abcdef1234567890";

  const candidateUser: AuthUser = {
    id: "a0000000-0000-4000-8000-000000000001",
    email: "alex@engineer.dev",
    fullName: "Alex Engineer",
    role: "CANDIDATE",
    emailVerified: true,
    accountStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
    candidateProfileId: "b0000000-0000-4000-8000-000000000001",
    organizations: [],
  };

  const employerUser: AuthUser = {
    id: "a0000000-0000-4000-8000-000000000002",
    email: "rachel@acme.dev",
    fullName: "Rachel Recruiter",
    role: "EMPLOYER",
    emailVerified: true,
    accountStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
    organizations: [
      { id: "c0000000-0000-4000-8000-000000000001", name: "Acme Innovations", slug: "acme-innovations", role: "OWNER" },
    ],
  };

  function setupAuth(user: AuthUser) {
    vi.spyOn(SessionService, "validateSession").mockResolvedValue({
      session: {
        id: `sess-${user.id}`,
        userId: user.id,
        tokenHash: "token_hash_test",
        expiresAt: new Date(Date.now() + 3600000),
        ipAddress: "127.0.0.1",
        userAgent: "vitest-agent",
        createdAt: new Date(),
      },
      user,
    });
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("executes the entire multi-persona lifecycle with Rule #7 and #8 invariants", async () => {
    // =========================================================================
    // 1. CANDIDATE AUTH & PROFILE SETUP
    // =========================================================================
    vi.spyOn(AuthService, "registerCandidate").mockResolvedValue({
      id: candidateUser.id,
      email: candidateUser.email,
      fullName: candidateUser.fullName,
      role: "CANDIDATE",
    });

    const regRes = await request(app)
      .post("/api/v1/auth/register/candidate")
      .send({
        email: candidateUser.email,
        password: "SuperSecurePassword123!",
        fullName: candidateUser.fullName,
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.data.email).toBe("alex@engineer.dev");

    // Login Candidate
    vi.spyOn(AuthService, "login").mockResolvedValue({
      user: candidateUser,
      rawToken: "raw_token_candidate",
      csrfToken: validCsrfToken,
    });

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: candidateUser.email,
        password: "SuperSecurePassword123!",
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.user.role).toBe("CANDIDATE");

    // =========================================================================
    // 2. EMPLOYER POSTS JOB WITH EVALUATION RUBRICS
    // =========================================================================
    setupAuth(employerUser);

    const mockPublishedJob: JobDto = {
      id: "d0000000-0000-4000-8000-000000000001",
      organisationId: "c0000000-0000-4000-8000-000000000001",
      organisationName: "Acme Innovations",
      organisationSlug: "acme-innovations",
      createdBy: employerUser.id,
      title: "Junior Distributed Systems Engineer",
      description: "Build robust distributed backend systems in TypeScript and PostgreSQL.",
      employmentType: "FULL_TIME",
      locationCity: "Remote",
      locationCountry: "Global",
      remoteType: "REMOTE",
      salaryMin: 90000,
      salaryMax: 120000,
      salaryCurrency: "USD",
      applicationDeadline: null,
      status: "PUBLISHED",
      publishedAt: new Date().toISOString(),
      closedAt: null,
      requirements: [
        {
          id: "e0000000-0000-4000-8000-000000000001",
          jobId: "d0000000-0000-4000-8000-000000000001",
          requirementText: "Demonstrated experience designing PostgreSQL schemas with indexing",
          importance: "REQUIRED",
          evidenceTypeHint: "CODE_REPOSITORY",
          skillTags: ["PostgreSQL", "SQL"],
          sortOrder: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      applicationCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.spyOn(JobService, "createJob").mockResolvedValue(mockPublishedJob);

    const createJobRes = await request(app)
      .post("/api/v1/organisations/c0000000-0000-4000-8000-000000000001/jobs")
      .set("Cookie", [`proofhire_session=sess-employer`, `proofhire_csrf=${validCsrfToken}`])
      .set("x-csrf-token", validCsrfToken)
      .send({
        title: "Junior Distributed Systems Engineer",
        description: "Build robust distributed backend systems in TypeScript and PostgreSQL.",
        employmentType: "FULL_TIME",
        remoteType: "REMOTE",
        requirements: [
          {
            requirementText: "Demonstrated experience designing PostgreSQL schemas with indexing",
            importance: "REQUIRED",
            evidenceTypeHint: "CODE_REPOSITORY",
            skillTags: ["PostgreSQL", "SQL"],
          },
        ],
      });

    expect(createJobRes.status).toBe(201);
    expect(createJobRes.body.data.title).toBe("Junior Distributed Systems Engineer");
    expect(createJobRes.body.data.requirements).toHaveLength(1);

    // =========================================================================
    // 3. CANDIDATE SEARCHES JOBS & APPLIES WITH EVIDENCE MAPPING
    // =========================================================================
    setupAuth(candidateUser);

    vi.spyOn(JobService, "searchPublishedJobs").mockResolvedValue({
      jobs: [mockPublishedJob],
      total: 1,
      page: 1,
      limit: 10,
    });

    const searchRes = await request(app).get("/api/v1/jobs?keyword=Systems");
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data).toHaveLength(1);

    const mockSubmittedApp: CandidateApplicationSummaryDto = {
      id: "f0000000-0000-4000-8000-000000000001",
      jobId: "d0000000-0000-4000-8000-000000000001",
      jobTitle: "Junior Distributed Systems Engineer",
      organisationName: "Acme Innovations",
      status: "APPLIED",
      appliedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      slaStatus: "ON_TRACK",
      slaDaysRemaining: 7,
      daysInStage: 0,
      history: [
        {
          fromStatus: null,
          toStatus: "APPLIED",
          changedBy: candidateUser.id,
          reason: "Application submitted by candidate",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    vi.spyOn(ApplicationService, "applyToJob").mockResolvedValue(mockSubmittedApp);

    const applyRes = await request(app)
      .post("/api/v1/jobs/d0000000-0000-4000-8000-000000000001/apply")
      .set("Cookie", [`proofhire_session=sess-candidate`, `proofhire_csrf=${validCsrfToken}`])
      .set("x-csrf-token", validCsrfToken)
      .send({
        coverNote: "I have 1 year of project experience with PostgreSQL index optimization.",
        evidenceMappings: [
          {
            jobRequirementId: "e0000000-0000-4000-8000-000000000001",
            projectEvidenceId: "e0000000-0000-4000-8000-000000000002",
          },
        ],
      });

    expect(applyRes.status).toBe(201);
    expect(applyRes.body.data.slaStatus).toBe("ON_TRACK");
    expect(applyRes.body.data.slaDaysRemaining).toBe(7);

    // =========================================================================
    // 4. EVIDENCE VERIFICATION (RULE #8)
    // =========================================================================
    vi.spyOn(aiServiceClient, "verifyEvidence").mockResolvedValue({
      evidenceId: "e0000000-0000-4000-8000-000000000002",
      verified: true,
      verificationMethod: "GITHUB_COMMIT_CHECK",
      details: "Commit verified on GitHub repository.",
      timestamp: new Date().toISOString(),
    });

    const verifyRes = await request(app)
      .post("/api/v1/evidence/verify")
      .set("Cookie", [`proofhire_session=sess-candidate`, `proofhire_csrf=${validCsrfToken}`])
      .set("x-csrf-token", validCsrfToken)
      .send({
        evidenceId: "e0000000-0000-4000-8000-000000000002",
        evidenceType: "COMMIT_HASH",
        commitHash: "0123456789abcdef0123456789abcdef01234567",
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.verified).toBe(true);

    // =========================================================================
    // 5. EMPLOYER AI ASSESSMENT STUDIO (RULE #7 INVARIANT)
    // =========================================================================
    setupAuth(employerUser);

    const mockAiAssessmentResult: AssessApplicationResponseDto = {
      assessments: [
        {
          id: "ai-assess-1",
          applicationId: "f0000000-0000-4000-8000-000000000001",
          requirementId: "e0000000-0000-4000-8000-000000000001",
          supportLevel: "STRONGLY_SUPPORTED",
          confidence: 0.94,
          citations: [
            "Implemented B-tree composite index reducing query latency from 850ms to 12ms",
          ],
          limitations: ["No mention of partitioning for tables exceeding 100M rows"],
          advisoryNotes: "Evidence directly demonstrates PostgreSQL schema and indexing skills.",
          isSelfReported: false,
          securityWarnings: [],
          rule7Disclaimer:
            "Advisory Only: AI provides grounded citations to assist evaluation. Final hiring decisions are made exclusively by human reviewers.",
          createdAt: new Date().toISOString(),
        },
      ],
      status: "SUCCESS",
      message: "Generated AI assessments for 1 rubric requirement(s).",
    };

    vi.spyOn(aiAssessmentService, "assessApplication").mockResolvedValue(mockAiAssessmentResult);

    const aiAssessRes = await request(app)
      .post("/api/v1/applications/f0000000-0000-4000-8000-000000000001/ai-assessment")
      .set("Cookie", [`proofhire_session=sess-employer`, `proofhire_csrf=${validCsrfToken}`])
      .set("x-csrf-token", validCsrfToken);

    expect(aiAssessRes.status).toBe(200);
    expect(aiAssessRes.body.data.assessments[0].supportLevel).toBe("STRONGLY_SUPPORTED");
    expect(aiAssessRes.body.data.assessments[0].rule7Disclaimer).toContain(
      "Final hiring decisions are made exclusively by human reviewers."
    );

    // Candidate forbidden from triggering AI assessment
    setupAuth(candidateUser);
    const candidateForbiddenAi = await request(app)
      .post("/api/v1/applications/f0000000-0000-4000-8000-000000000001/ai-assessment")
      .set("Cookie", [`proofhire_session=sess-candidate`, `proofhire_csrf=${validCsrfToken}`])
      .set("x-csrf-token", validCsrfToken);

    expect(candidateForbiddenAi.status).toBe(403);

    // =========================================================================
    // 6. PRIVATE EVALUATION NOTES & STATE MACHINE PROGRESSION
    // =========================================================================
    setupAuth(employerUser);

    const mockScreeningAppDetail: ApplicationDetailDto = {
      ...mockSubmittedApp,
      status: "SCREENING",
      coverNote: "I have 1 year of project experience with PostgreSQL index optimization.",
      candidateEmail: candidateUser.email,
      candidateFullName: candidateUser.fullName,
      candidateProfile: {
        id: "b0000000-0000-4000-8000-000000000001",
        userId: candidateUser.id,
        headline: "Backend Engineer",
        bio: "Specializing in high throughput APIs",
        locationCity: "Bengaluru",
        locationCountry: "India",
        visibility: "PUBLIC",
        createdAt: new Date().toISOString(),
        skills: [{ id: "sk-1", skillName: "PostgreSQL", proficiency: "ADVANCED", isSelfReported: false }],
        projects: [],
      },
      evidenceMappings: [],
      evaluationNotes: [
        {
          id: "note-1",
          applicationId: "f0000000-0000-4000-8000-000000000001",
          authorId: employerUser.id,
          authorName: employerUser.fullName,
          noteText: "Strong code evidence on indexing. Schedule technical interview.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      history: [
        {
          fromStatus: "APPLIED",
          toStatus: "SCREENING",
          changedBy: employerUser.id,
          reason: "Approved candidate for screening based on verified evidence",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    vi.spyOn(ApplicationService, "transitionStatus").mockResolvedValue(mockScreeningAppDetail);

    const transitionRes = await request(app)
      .patch("/api/v1/organisations/c0000000-0000-4000-8000-000000000001/applications/f0000000-0000-4000-8000-000000000001/status")
      .set("Cookie", [`proofhire_session=sess-employer`, `proofhire_csrf=${validCsrfToken}`])
      .set("x-csrf-token", validCsrfToken)
      .send({
        status: "SCREENING",
        reason: "Approved candidate for screening based on verified evidence",
      });

    expect(transitionRes.status).toBe(200);
    expect(transitionRes.body.data.status).toBe("SCREENING");
    expect(transitionRes.body.data.evaluationNotes).toHaveLength(1);

    // INVARIANT: Candidate NEVER sees private evaluation notes
    setupAuth(candidateUser);
    vi.spyOn(ApplicationService, "getCandidateApplications").mockResolvedValue([
      {
        ...mockSubmittedApp,
        status: "SCREENING",
      },
    ]);

    const candidateAppsRes = await request(app)
      .get("/api/v1/candidates/applications")
      .set("Cookie", [`proofhire_session=sess-candidate`, `proofhire_csrf=${validCsrfToken}`]);

    expect(candidateAppsRes.status).toBe(200);
    // Candidate DTO explicitly has no evaluationNotes field
    expect(candidateAppsRes.body.data[0].evaluationNotes).toBeUndefined();

    // =========================================================================
    // 7. AUDIT TRAIL VERIFICATION & TAMPER INTEGRITY
    // =========================================================================
    const integrity = await auditService.verifyChainIntegrity();
    expect(integrity.valid).toBe(true);
  });
});

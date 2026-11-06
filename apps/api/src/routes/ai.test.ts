import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { SessionService } from "../services/sessionService.js";
import { aiAssessmentService } from "../services/aiAssessmentService.js";
import { aiServiceClient } from "../services/aiServiceClient.js";
import type { AuthUser, AiAssessmentDto } from "@proofhire/shared-contracts";

describe("AI Assessment and Verification Routes", () => {
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

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/v1/applications/:id/ai-assessment", () => {
    it("rejects unauthenticated requests with 401", async () => {
      const res = await request(app).post("/api/v1/applications/app-1/ai-assessment");
      expect(res.status).toBe(401);
    });

    it("strictly blocks candidates from triggering or viewing AI assessments (403)", async () => {
      setupAuth(candidateUser);
      const res = await request(app)
        .post("/api/v1/applications/app-1/ai-assessment")
        .set("Cookie", [`proofhire_session=token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken);

      expect(res.status).toBe(403);
    });

    it("generates grounded AI assessment for authorized employer with Rule #7 disclaimer", async () => {
      setupAuth(employerUser);

      const mockAssessment: AiAssessmentDto = {
        id: "assess-1",
        applicationId: "app-1",
        requirementId: "req-1",
        supportLevel: "SUPPORTED",
        confidence: 0.89,
        citations: ["Authored Drizzle schema migrations for 12 tables"],
        limitations: ["No Kubernetes experience found"],
        advisoryNotes: "Candidate directly demonstrates PostgreSQL competence.",
        isSelfReported: true,
        securityWarnings: [],
        rule7Disclaimer:
          "Advisory Only: AI provides grounded citations to assist evaluation. Final hiring decisions are made exclusively by human reviewers.",
        createdAt: new Date().toISOString(),
      };

      vi.spyOn(aiAssessmentService, "assessApplication").mockResolvedValue({
        assessments: [mockAssessment],
        status: "SUCCESS",
        message: "Generated AI assessments for 1 rubric requirement(s).",
      });

      const res = await request(app)
        .post("/api/v1/applications/app-1/ai-assessment")
        .set("Cookie", [`proofhire_session=token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assessments).toHaveLength(1);
      expect(res.body.data.assessments[0].supportLevel).toBe("SUPPORTED");
      expect(res.body.data.assessments[0].rule7Disclaimer).toContain("Advisory Only");
      expect(res.body.data.assessments[0].isSelfReported).toBe(true);
    });
  });

  describe("GET /api/v1/applications/:id/ai-assessment", () => {
    it("retrieves previously computed AI assessments for employer", async () => {
      setupAuth(employerUser);

      const mockAssessments: AiAssessmentDto[] = [
        {
          id: "assess-1",
          applicationId: "app-1",
          requirementId: "req-1",
          supportLevel: "SUPPORTED",
          confidence: 0.92,
          citations: ["Wrote REST APIs with TypeScript"],
          limitations: [],
          advisoryNotes: "Evidence directly covers TypeScript REST APIs.",
          isSelfReported: true,
          securityWarnings: [],
          rule7Disclaimer: "Advisory Only: AI provides grounded citations to assist evaluation.",
          createdAt: new Date().toISOString(),
        },
      ];

      vi.spyOn(aiAssessmentService, "getApplicationAssessments").mockResolvedValue(mockAssessments);

      const res = await request(app)
        .get("/api/v1/applications/app-1/ai-assessment")
        .set("Cookie", [`proofhire_session=token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("POST /api/v1/evidence/verify", () => {
    it("validates GitHub repository evidence via independent verification check", async () => {
      setupAuth(candidateUser);

      vi.spyOn(aiServiceClient, "verifyEvidence").mockResolvedValue({
        evidenceId: "ev-1",
        verified: true,
        verificationMethod: "GITHUB_REPOSITORY_CHECK",
        details: "Valid GitHub repository syntax confirmed: owner='facebook', repo='react'.",
        timestamp: new Date().toISOString(),
      });

      const res = await request(app)
        .post("/api/v1/evidence/verify")
        .set("Cookie", [`proofhire_session=token`, `proofhire_csrf=${validCsrfToken}`])
        .set("x-csrf-token", validCsrfToken)
        .send({
          evidenceId: "11111111-1111-1111-1111-111111111111",
          evidenceType: "GITHUB_REPO",
          repoUrl: "https://github.com/facebook/react",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verified).toBe(true);
      expect(res.body.data.verificationMethod).toBe("GITHUB_REPOSITORY_CHECK");
    });
  });

  describe("AiServiceClient Graceful Degradation & Fallback", () => {
    it("produces deterministic fallback when external AI service is unreachable", async () => {
      // Test fallback directly on aiServiceClient instance
      const result = await aiServiceClient.generateExplanation(
        "Experience with Docker and containerization",
        [
          {
            id: "ev-1",
            title: "DevOps Setup",
            text: "Created multi-stage Docker container build with optimized caching.",
            isSelfReported: true,
          },
        ]
      );

      // Verify fallback behavior preserves invariants
      expect(result.rule7Disclaimer).toContain("Advisory Only");
      expect(result.isSelfReported).toBe(true);
      expect(result.citations).toHaveLength(1);
      expect(result.citations[0]).toContain("Docker");
    });
  });
});

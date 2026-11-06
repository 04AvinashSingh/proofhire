import { describe, it, expect } from "vitest";
import {
  RegisterCandidateRequestSchema,
  RegisterEmployerRequestSchema,
  LoginRequestSchema,
  CreateOrganizationRequestSchema,
  HealthCheckResponseSchema,
  UserRoleSchema,
} from "./index.js";

describe("Shared Contracts", () => {
  describe("UserRoleSchema", () => {
    it("validates allowed roles", () => {
      expect(UserRoleSchema.parse("CANDIDATE")).toBe("CANDIDATE");
      expect(UserRoleSchema.parse("EMPLOYER")).toBe("EMPLOYER");
      expect(UserRoleSchema.parse("ADMIN")).toBe("ADMIN");
    });

    it("rejects unknown roles", () => {
      expect(() => UserRoleSchema.parse("SUPERUSER")).toThrow();
    });
  });

  describe("RegisterCandidateRequestSchema", () => {
    it("accepts valid candidate registration payload", () => {
      const valid = {
        email: "candidate@example.com",
        password: "securePassword123!",
        fullName: "Jane Doe",
      };
      const parsed = RegisterCandidateRequestSchema.parse(valid);
      expect(parsed.email).toBe("candidate@example.com");
      expect(parsed.fullName).toBe("Jane Doe");
    });

    it("lowercases email automatically", () => {
      const parsed = RegisterCandidateRequestSchema.parse({
        email: "Jane.Doe@EXAMPLE.COM",
        password: "securePassword123!",
        fullName: "Jane Doe",
      });
      expect(parsed.email).toBe("jane.doe@example.com");
    });

    it("rejects invalid email", () => {
      expect(() =>
        RegisterCandidateRequestSchema.parse({
          email: "not-an-email",
          password: "password123",
          fullName: "Jane Doe",
        })
      ).toThrow();
    });

    it("rejects short passwords", () => {
      expect(() =>
        RegisterCandidateRequestSchema.parse({
          email: "test@example.com",
          password: "short",
          fullName: "Jane Doe",
        })
      ).toThrow();
    });
  });

  describe("RegisterEmployerRequestSchema", () => {
    it("accepts valid employer registration payload with organization", () => {
      const valid = {
        email: "recruiter@acme.corp",
        password: "securePassword123!",
        fullName: "Alice Smith",
        organizationName: "Acme Corp",
        organizationSlug: "acme-corp",
      };
      const parsed = RegisterEmployerRequestSchema.parse(valid);
      expect(parsed.email).toBe("recruiter@acme.corp");
      expect(parsed.organizationName).toBe("Acme Corp");
      expect(parsed.organizationSlug).toBe("acme-corp");
    });

    it("rejects invalid organization slug with spaces or uppercase", () => {
      expect(() =>
        RegisterEmployerRequestSchema.parse({
          email: "recruiter@acme.corp",
          password: "securePassword123!",
          fullName: "Alice Smith",
          organizationName: "Acme Corp",
          organizationSlug: "Acme Corp Invalid",
        })
      ).toThrow();
    });
  });

  describe("CreateOrganizationRequestSchema", () => {
    it("validates organization creation with optional fields", () => {
      const parsed = CreateOrganizationRequestSchema.parse({
        name: "Tech Innovators",
        slug: "tech-innovators",
        website: "https://example.com",
        sizeRange: "51-200",
      });
      expect(parsed.name).toBe("Tech Innovators");
      expect(parsed.sizeRange).toBe("51-200");
    });
  });

  describe("HealthCheckResponseSchema", () => {
    it("validates a healthy payload", () => {
      const payload = {
        status: "ok",
        version: "0.1.0",
        environment: "development",
        uptime: 12.34,
        timestamp: new Date().toISOString(),
      };
      expect(HealthCheckResponseSchema.parse(payload)).toEqual(payload);
    });
  });

  describe("Jobs & Application Lifecycle Contracts", () => {
    it("validates CreateJobRequestSchema with requirements", async () => {
      const { CreateJobRequestSchema } = await import("./index.js");
      const valid = {
        title: "Junior Backend Engineer",
        description: "Build robust scalable APIs with Node.js and PostgreSQL.",
        employmentType: "FULL_TIME",
        remoteType: "REMOTE",
        requirements: [
          {
            requirementText: "Experience with PostgreSQL schema design",
            importance: "REQUIRED",
            evidenceTypeHint: "Link to schema migration or PR",
            skillTags: ["PostgreSQL", "SQL"],
          },
        ],
      };
      const parsed = CreateJobRequestSchema.parse(valid);
      expect(parsed.title).toBe("Junior Backend Engineer");
      expect(parsed.requirements).toHaveLength(1);
      expect(parsed.requirements[0].importance).toBe("REQUIRED");
    });

    it("enforces strict application lifecycle state machine transitions", async () => {
      const { isValidStatusTransition } = await import("./index.js");

      // Valid transitions
      expect(isValidStatusTransition("APPLIED", "SCREENING")).toBe(true);
      expect(isValidStatusTransition("APPLIED", "REJECTED")).toBe(true);
      expect(isValidStatusTransition("SCREENING", "INTERVIEW")).toBe(true);
      expect(isValidStatusTransition("SCREENING", "REJECTED")).toBe(true);
      expect(isValidStatusTransition("INTERVIEW", "OFFER")).toBe(true);
      expect(isValidStatusTransition("OFFER", "HIRED")).toBe(true);
      expect(isValidStatusTransition("REJECTED", "SCREENING")).toBe(true); // Reopened

      // Invalid transitions
      expect(isValidStatusTransition("APPLIED", "OFFER")).toBe(false);
      expect(isValidStatusTransition("APPLIED", "HIRED")).toBe(false);
      expect(isValidStatusTransition("HIRED", "REJECTED")).toBe(false);
      expect(isValidStatusTransition("REJECTED", "HIRED")).toBe(false);
    });
  });

  describe("AI & Verification Contracts", () => {
    it("validates AiAssessmentSchema with Rule #7 and #8 invariants", async () => {
      const { AiAssessmentSchema, SupportLevelEnum } = await import("./index.js");
      const assessment = {
        id: "11111111-1111-1111-1111-111111111111",
        applicationId: "22222222-2222-2222-2222-222222222222",
        requirementId: "33333333-3333-3333-3333-333333333333",
        supportLevel: "SUPPORTED",
        confidence: 0.88,
        citations: ["Authored PostgreSQL schema migrations"],
        limitations: ["No Kubernetes cluster experience"],
        advisoryNotes: "Candidate evidence directly demonstrates PostgreSQL competence.",
        isSelfReported: true,
        securityWarnings: [],
        rule7Disclaimer: "Advisory Only: AI provides grounded citations to assist evaluation. Final hiring decisions are made exclusively by human reviewers.",
        createdAt: new Date().toISOString(),
      };

      const parsed = AiAssessmentSchema.parse(assessment);
      expect(parsed.supportLevel).toBe(SupportLevelEnum.enum.SUPPORTED);
      expect(parsed.isSelfReported).toBe(true);
      expect(parsed.rule7Disclaimer).toContain("Advisory Only");
    });

    it("validates VerifyEvidenceRequestSchema", async () => {
      const { VerifyEvidenceRequestSchema } = await import("./index.js");
      const valid = {
        evidenceId: "44444444-4444-4444-4444-444444444444",
        evidenceType: "GITHUB_REPO",
        repoUrl: "https://github.com/candidate/portfolio",
      };
      const parsed = VerifyEvidenceRequestSchema.parse(valid);
      expect(parsed.evidenceType).toBe("GITHUB_REPO");
    });
  });
});


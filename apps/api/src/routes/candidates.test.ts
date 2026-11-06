import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { SessionService } from "../services/sessionService.js";
import { CandidateProfileService } from "../services/candidateProfileService.js";
import { ProjectService } from "../services/projectService.js";
import { PortfolioService } from "../services/portfolioService.js";
import { storageService } from "../services/storageService.js";
import type { AuthUser, CandidatePortfolioDto } from "@proofhire/shared-contracts";

describe("Candidate Profile and Evidence Portfolio Routes", () => {
  const app = createApp();

  const candidateUser: AuthUser = {
    id: "candidate-user-1",
    email: "dev@proofhire.io",
    fullName: "Alex Engineer",
    role: "CANDIDATE",
    emailVerified: true,
    accountStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
    candidateProfileId: "cand-profile-1",
    organizations: [],
  };

  const employerUser: AuthUser = {
    id: "employer-user-1",
    email: "recruiter@tech.corp",
    fullName: "Jane Recruiter",
    role: "EMPLOYER",
    emailVerified: true,
    accountStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
    organizations: [{ id: "org-1", name: "Tech Corp", slug: "tech-corp", role: "OWNER" }],
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

  describe("GET & PATCH /api/v1/candidates/profile", () => {
    it("returns candidate profile for authenticated candidate", async () => {
      setupAuth(candidateUser);

      vi.spyOn(CandidateProfileService, "getProfileByUserId").mockResolvedValueOnce({
        id: "cand-profile-1",
        userId: candidateUser.id,
        bio: "Full-stack developer enthusiastic about TypeScript and distributed systems.",
        locationCity: "Bengaluru",
        locationCountry: "India",
        status: "ACTIVELY_LOOKING",
        visibility: "PUBLIC",
        yearsExperience: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .get("/api/v1/candidates/profile")
        .set("Cookie", ["proofhire_session=token-candidate"]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bio).toContain("Full-stack developer");
      expect(res.body.data.visibility).toBe("PUBLIC");
    });

    it("rejects non-candidate roles from modifying candidate profile", async () => {
      setupAuth(employerUser);

      const res = await request(app)
        .patch("/api/v1/candidates/profile")
        .set("Cookie", [
          "proofhire_session=token-employer",
          `proofhire_csrf=${validCsrfToken}`,
        ])
        .set("x-csrf-token", validCsrfToken)
        .send({ bio: "Malicious update" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("updates candidate profile fields", async () => {
      setupAuth(candidateUser);

      vi.spyOn(CandidateProfileService, "getProfileByUserId").mockResolvedValueOnce({
        id: "cand-profile-1",
        userId: candidateUser.id,
        bio: "Old bio",
        locationCity: null,
        locationCountry: null,
        status: "OPEN",
        visibility: "PUBLIC",
        yearsExperience: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.spyOn(CandidateProfileService, "updateProfile").mockResolvedValueOnce({
        id: "cand-profile-1",
        userId: candidateUser.id,
        bio: "Updated high-impact bio",
        locationCity: "Hyderabad",
        locationCountry: "India",
        status: "ACTIVELY_LOOKING",
        visibility: "PUBLIC",
        yearsExperience: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .patch("/api/v1/candidates/profile")
        .set("Cookie", [
          "proofhire_session=token-candidate",
          `proofhire_csrf=${validCsrfToken}`,
        ])
        .set("x-csrf-token", validCsrfToken)
        .send({
          bio: "Updated high-impact bio",
          locationCity: "Hyderabad",
          locationCountry: "India",
          status: "ACTIVELY_LOOKING",
          yearsExperience: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bio).toBe("Updated high-impact bio");
      expect(res.body.data.locationCity).toBe("Hyderabad");
    });
  });

  describe("Skills Inventory Management", () => {
    it("adds a skill and marks it as self-reported (Invariant #8)", async () => {
      setupAuth(candidateUser);

      vi.spyOn(CandidateProfileService, "getProfileByUserId").mockResolvedValueOnce({
        id: "cand-profile-1",
        userId: candidateUser.id,
        bio: null,
        locationCity: null,
        locationCountry: null,
        status: null,
        visibility: "PUBLIC",
        yearsExperience: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.spyOn(CandidateProfileService, "addSkill").mockResolvedValueOnce({
        id: "skill-1",
        candidateId: "cand-profile-1",
        skillName: "TypeScript",
        proficiency: "ADVANCED",
        category: "Languages",
        isSelfReported: true, // Invariant verification
        createdAt: new Date(),
      });

      const res = await request(app)
        .post("/api/v1/candidates/skills")
        .set("Cookie", [
          "proofhire_session=token-candidate",
          `proofhire_csrf=${validCsrfToken}`,
        ])
        .set("x-csrf-token", validCsrfToken)
        .send({
          skillName: "TypeScript",
          proficiency: "ADVANCED",
          category: "Languages",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.skillName).toBe("TypeScript");
      expect(res.body.data.isSelfReported).toBe(true);
    });
  });

  describe("Projects & Evidence Management", () => {
    it("creates a project with repository links and personal contribution", async () => {
      setupAuth(candidateUser);

      vi.spyOn(CandidateProfileService, "getProfileByUserId").mockResolvedValueOnce({
        id: "cand-profile-1",
        userId: candidateUser.id,
        bio: null,
        locationCity: null,
        locationCountry: null,
        status: null,
        visibility: "PUBLIC",
        yearsExperience: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.spyOn(ProjectService, "createProject").mockResolvedValueOnce({
        id: "project-uuid-1",
        candidateId: "cand-profile-1",
        name: "Distributed Key-Value Store",
        description: "A Raft-consensus based distributed key value store written in Go.",
        roleInProject: "SOLE_DEVELOPER",
        teamSize: 1,
        personalContribution: "Implemented the Raft leader election, log replication, and RPC transport.",
        githubUrl: "https://github.com/alex/raft-kv",
        projectUrl: null,
        demoUrl: null,
        isTeamProject: false,
        startDate: "2024-01-01",
        endDate: "2024-06-01",
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        evidence: [],
      });

      const res = await request(app)
        .post("/api/v1/candidates/projects")
        .set("Cookie", [
          "proofhire_session=token-candidate",
          `proofhire_csrf=${validCsrfToken}`,
        ])
        .set("x-csrf-token", validCsrfToken)
        .send({
          name: "Distributed Key-Value Store",
          description: "A Raft-consensus based distributed key value store written in Go.",
          roleInProject: "SOLE_DEVELOPER",
          personalContribution: "Implemented the Raft leader election, log replication, and RPC transport.",
          githubUrl: "https://github.com/alex/raft-kv",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Distributed Key-Value Store");
      expect(res.body.data.githubUrl).toBe("https://github.com/alex/raft-kv");
    });

    it("adds evidence with skill tags and marks it as self-reported", async () => {
      setupAuth(candidateUser);

      vi.spyOn(CandidateProfileService, "getProfileByUserId").mockResolvedValueOnce({
        id: "cand-profile-1",
        userId: candidateUser.id,
        bio: null,
        locationCity: null,
        locationCountry: null,
        status: null,
        visibility: "PUBLIC",
        yearsExperience: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.spyOn(ProjectService, "addEvidence").mockResolvedValueOnce({
        id: "evidence-uuid-1",
        projectId: "project-uuid-1",
        evidenceType: "GITHUB_URL",
        title: "Raft Leader Election Pull Request",
        description: "PR implementing log term validation and election timeouts.",
        url: "https://github.com/alex/raft-kv/pull/12",
        filePath: null,
        personalContribution: "Authored all 400 lines of Raft consensus logic.",
        isSelfReported: true, // Invariant verification
        skillTags: ["Go", "Distributed Systems", "Raft"],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post("/api/v1/candidates/projects/project-uuid-1/evidence")
        .set("Cookie", [
          "proofhire_session=token-candidate",
          `proofhire_csrf=${validCsrfToken}`,
        ])
        .set("x-csrf-token", validCsrfToken)
        .send({
          evidenceType: "GITHUB_URL",
          title: "Raft Leader Election Pull Request",
          description: "PR implementing log term validation and election timeouts.",
          url: "https://github.com/alex/raft-kv/pull/12",
          personalContribution: "Authored all 400 lines of Raft consensus logic.",
          skillTags: ["Go", "Distributed Systems", "Raft"],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.skillTags).toEqual(["Go", "Distributed Systems", "Raft"]);
      expect(res.body.data.isSelfReported).toBe(true);
    });
  });

  describe("Artifact Upload (ADR-006)", () => {
    it("safely uploads an architecture diagram and returns file details", async () => {
      setupAuth(candidateUser);

      vi.spyOn(storageService, "saveFile").mockResolvedValueOnce({
        filePath: "/app/apps/api/uploads/safe-uuid-1234.png",
        fileName: "safe-uuid-1234.png",
        size: 1024,
      });

      const base64Data = Buffer.from("fake-diagram-content").toString("base64");

      const res = await request(app)
        .post("/api/v1/candidates/artifacts/upload")
        .set("Cookie", [
          "proofhire_session=token-candidate",
          `proofhire_csrf=${validCsrfToken}`,
        ])
        .set("x-csrf-token", validCsrfToken)
        .send({
          fileName: "system-architecture.png",
          mimeType: "image/png",
          base64Data,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fileName).toBe("safe-uuid-1234.png");
    });
  });

  describe("Public & Employer Portfolio View", () => {
    it("returns public portfolio with project evidence and self-reported labels", async () => {
      const mockPortfolio: CandidatePortfolioDto = {
        profile: {
          id: "cand-profile-1",
          userId: "user-1",
          bio: "Software developer",
          locationCity: "Bengaluru",
          locationCountry: "India",
          status: "ACTIVELY_LOOKING",
          visibility: "PUBLIC",
          yearsExperience: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        fullName: "Alex Engineer",
        email: "", // masked on public view
        skills: [
          {
            id: "sk-1",
            skillName: "Go",
            proficiency: "ADVANCED",
            category: "Languages",
            isSelfReported: true,
            createdAt: new Date().toISOString(),
          },
        ],
        education: [],
        experience: [],
        projects: [
          {
            id: "proj-1",
            candidateId: "cand-profile-1",
            name: "Raft KV",
            description: "Distributed key-value store",
            roleInProject: "SOLE_DEVELOPER",
            teamSize: 1,
            personalContribution: "All code",
            githubUrl: "https://github.com/alex/raft-kv",
            projectUrl: null,
            demoUrl: null,
            isTeamProject: false,
            startDate: null,
            endDate: null,
            sortOrder: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            evidence: [
              {
                id: "ev-1",
                projectId: "proj-1",
                evidenceType: "GITHUB_URL",
                title: "Core PR",
                description: "PR for consensus",
                url: "https://github.com/alex/raft-kv/pull/1",
                filePath: null,
                personalContribution: "Authored consensus engine",
                isSelfReported: true,
                skillTags: ["Go"],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          },
        ],
      };

      vi.spyOn(PortfolioService, "getPortfolio").mockResolvedValueOnce(mockPortfolio);

      const res = await request(app).get("/api/v1/candidates/portfolio/cand-profile-1");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe("Alex Engineer");
      expect(res.body.data.projects[0].evidence[0].isSelfReported).toBe(true);
    });
  });
});

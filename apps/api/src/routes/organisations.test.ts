import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { SessionService } from "../services/sessionService.js";
import { OrganizationService } from "../services/organizationService.js";
import { ForbiddenError } from "../errors/AppError.js";
import type { AuthUser } from "@proofhire/shared-contracts";

describe("Organisation Routes & Tenant Isolation", () => {
  const app = createApp();

  const employerA: AuthUser = {
    id: "user-employer-a",
    email: "alice@orga.com",
    fullName: "Alice A",
    role: "EMPLOYER",
    emailVerified: true,
    accountStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
    organizations: [{ id: "org-a-id", name: "Org A", slug: "org-a", role: "OWNER" }],
  };

  const candidate: AuthUser = {
    id: "user-candidate",
    email: "bob@candidate.com",
    fullName: "Bob C",
    role: "CANDIDATE",
    emailVerified: true,
    accountStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
    organizations: [],
  };

  const admin: AuthUser = {
    id: "user-admin",
    email: "admin@proofhire.com",
    fullName: "Platform Admin",
    role: "ADMIN",
    emailVerified: true,
    accountStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
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

  describe("Cross-Tenant Isolation (Invariant Enforcement)", () => {
    it("allows employer to view their own organization", async () => {
      setupAuth(employerA);

      vi.spyOn(OrganizationService, "getOrganizationById").mockResolvedValueOnce({
        id: "org-a-id",
        name: "Org A",
        slug: "org-a",
        website: "https://orga.com",
        description: "Organization A",
        sizeRange: "11-50",
        industry: "Tech",
        headquarters: "San Francisco",
        logoUrl: null,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRole: "OWNER",
      });

      const res = await request(app)
        .get("/api/v1/organisations/org-a-id")
        .set("Cookie", ["proofhire_session=token-employer-a"]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe("org-a-id");
    });

    it("rejects employer trying to access another organization (Cross-Tenant Leak Prevention)", async () => {
      setupAuth(employerA);

      vi.spyOn(OrganizationService, "getOrganizationById").mockRejectedValueOnce(
        new ForbiddenError("You do not have access to this organization")
      );

      const res = await request(app)
        .get("/api/v1/organisations/org-b-id-private")
        .set("Cookie", ["proofhire_session=token-employer-a"]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("FORBIDDEN");
      expect(res.body.error.message).toContain("access to this organization");
    });

    it("allows platform ADMIN to view any organization", async () => {
      setupAuth(admin);

      vi.spyOn(OrganizationService, "getOrganizationById").mockResolvedValueOnce({
        id: "org-any-id",
        name: "Any Org",
        slug: "any-org",
        website: null,
        description: null,
        sizeRange: null,
        industry: null,
        headquarters: null,
        logoUrl: null,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .get("/api/v1/organisations/org-any-id")
        .set("Cookie", ["proofhire_session=token-admin"]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Role-Based Access Control (RBAC)", () => {
    it("prohibits candidate from creating an organization", async () => {
      setupAuth(candidate);

      const res = await request(app)
        .post("/api/v1/organisations")
        .set("Cookie", [
          "proofhire_session=token-candidate",
          `proofhire_csrf=${validCsrfToken}`,
        ])
        .set("x-csrf-token", validCsrfToken)
        .send({
          name: "Invalid Candidate Org",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("FORBIDDEN");
      expect(res.body.error.message).toContain("Access restricted to roles");
    });
  });

  describe("CSRF Protection (Double-Submit Cookie Pattern)", () => {
    it("rejects state-changing requests when CSRF token is missing", async () => {
      setupAuth(employerA);

      const res = await request(app)
        .post("/api/v1/organisations")
        .set("Cookie", ["proofhire_session=token-employer-a"])
        // No CSRF header or cookie!
        .send({ name: "New Sub-Org" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain("CSRF");
    });

    it("rejects request when CSRF cookie does not match x-csrf-token header", async () => {
      setupAuth(employerA);

      const res = await request(app)
        .post("/api/v1/organisations")
        .set("Cookie", [
          "proofhire_session=token-employer-a",
          "proofhire_csrf=cookie_val_111",
        ])
        .set("x-csrf-token", "attacker_different_header_222")
        .send({ name: "New Sub-Org" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain("CSRF");
    });

    it("accepts state-changing request when CSRF cookie matches x-csrf-token header", async () => {
      setupAuth(employerA);

      vi.spyOn(OrganizationService, "createOrganization").mockResolvedValueOnce({
        id: "new-org-id",
        name: "New Sub-Org",
        slug: "new-sub-org",
        website: null,
        description: null,
        sizeRange: null,
        industry: null,
        headquarters: null,
        logoUrl: null,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post("/api/v1/organisations")
        .set("Cookie", [
          "proofhire_session=token-employer-a",
          `proofhire_csrf=${validCsrfToken}`,
        ])
        .set("x-csrf-token", validCsrfToken)
        .send({ name: "New Sub-Org" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe("new-org-id");
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { AuthService } from "../services/authService.js";
import { SessionService } from "../services/sessionService.js";
import { ConflictError, UnauthorizedError, ForbiddenError } from "../errors/AppError.js";
import type { AuthUser } from "@proofhire/shared-contracts";

describe("Auth Routes", () => {
  const app = createApp();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/v1/auth/register/candidate", () => {
    it("returns 201 Created when registration succeeds", async () => {
      vi.spyOn(AuthService, "registerCandidate").mockResolvedValueOnce({
        id: "11111111-1111-1111-1111-111111111111",
        email: "candidate@proofhire.dev",
        fullName: "Alex Dev",
        role: "CANDIDATE",
      });

      const res = await request(app)
        .post("/api/v1/auth/register/candidate")
        .send({
          email: "candidate@proofhire.dev",
          password: "SecurePassword123!",
          fullName: "Alex Dev",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        id: "11111111-1111-1111-1111-111111111111",
        email: "candidate@proofhire.dev",
        role: "CANDIDATE",
      });
    });

    it("returns 409 Conflict if email is already registered", async () => {
      vi.spyOn(AuthService, "registerCandidate").mockRejectedValueOnce(
        new ConflictError("An account with this email address already exists")
      );

      const res = await request(app)
        .post("/api/v1/auth/register/candidate")
        .send({
          email: "duplicate@proofhire.dev",
          password: "SecurePassword123!",
          fullName: "Alex Dev",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("CONFLICT");
    });

    it("returns 400 Bad Request on invalid payload", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register/candidate")
        .send({
          email: "not-an-email",
          password: "short",
          fullName: "A",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/v1/auth/register/employer", () => {
    it("returns 201 Created and registers employer with organization", async () => {
      vi.spyOn(AuthService, "registerEmployer").mockResolvedValueOnce({
        id: "22222222-2222-2222-2222-222222222222",
        email: "employer@acme.com",
        fullName: "Jane Recruiter",
        organizationId: "33333333-3333-3333-3333-333333333333",
      });

      const res = await request(app)
        .post("/api/v1/auth/register/employer")
        .send({
          email: "employer@acme.com",
          password: "SecurePassword123!",
          fullName: "Jane Recruiter",
          organizationName: "Acme Corp",
          organizationSlug: "acme-corp",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.organizationId).toBe("33333333-3333-3333-3333-333333333333");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    const mockUser: AuthUser = {
      id: "11111111-1111-1111-1111-111111111111",
      email: "candidate@proofhire.dev",
      fullName: "Alex Dev",
      role: "CANDIDATE",
      emailVerified: false,
      accountStatus: "ACTIVE",
      createdAt: new Date().toISOString(),
      organizations: [],
    };

    it("sets HttpOnly cookie and CSRF cookie on successful login", async () => {
      vi.spyOn(AuthService, "login").mockResolvedValueOnce({
        user: mockUser,
        rawToken: "dummy_session_token_64chars_abcdef0123456789abcdef0123456789abcdef",
        csrfToken: "dummy_csrf_token_64chars_abcdef0123456789abcdef0123456789abcdef",
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "candidate@proofhire.dev",
          password: "SecurePassword123!",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("candidate@proofhire.dev");

      // Verify cookies
      const cookies = res.headers["set-cookie"] as unknown as string[];
      expect(cookies).toBeDefined();

      const sessionCookie = cookies.find((c: string) => c.startsWith("proofhire_session="));
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie).toContain("HttpOnly");
      expect(sessionCookie).toContain("SameSite=Strict");

      const csrfCookie = cookies.find((c: string) => c.startsWith("proofhire_csrf="));
      expect(csrfCookie).toBeDefined();
      expect(csrfCookie).toContain("SameSite=Strict");
      // CSRF cookie is NOT HttpOnly so client JS can read it for headers
      expect(csrfCookie).not.toContain("HttpOnly");
    });

    it("returns 401 Unauthorized for incorrect password", async () => {
      vi.spyOn(AuthService, "login").mockRejectedValueOnce(
        new UnauthorizedError("Invalid email or password")
      );

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "candidate@proofhire.dev",
          password: "WrongPassword!",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 403 Forbidden for suspended account", async () => {
      vi.spyOn(AuthService, "login").mockRejectedValueOnce(
        new ForbiddenError("Account access restricted. Status: SUSPENDED")
      );

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "suspended@proofhire.dev",
          password: "Password123!",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("returns current user when authenticated session cookie is present", async () => {
      const mockUser: AuthUser = {
        id: "11111111-1111-1111-1111-111111111111",
        email: "candidate@proofhire.dev",
        fullName: "Alex Dev",
        role: "CANDIDATE",
        emailVerified: true,
        accountStatus: "ACTIVE",
        createdAt: new Date().toISOString(),
        organizations: [],
      };

      vi.spyOn(SessionService, "validateSession").mockResolvedValueOnce({
        session: {
          id: "session-uuid",
          userId: mockUser.id,
          tokenHash: "hash",
          expiresAt: new Date(Date.now() + 3600000),
          ipAddress: null,
          userAgent: null,
          createdAt: new Date(),
        },
        user: mockUser,
      });

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", ["proofhire_session=valid_raw_session_token"]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(mockUser.id);
    });

    it("returns 401 Unauthorized when session cookie is absent", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("revokes session and clears cookies", async () => {
      const revokeSpy = vi.spyOn(AuthService, "logout").mockResolvedValueOnce();

      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", ["proofhire_session=active_token_to_logout"]);

      expect(res.status).toBe(200);
      expect(revokeSpy).toHaveBeenCalledWith("active_token_to_logout");

      const cookies = res.headers["set-cookie"] as unknown as string[];
      expect(cookies).toBeDefined();
      // Cleared cookies have empty value or expire in the past
      const sessionClear = cookies.find((c: string) => c.startsWith("proofhire_session="));
      expect(sessionClear).toBeDefined();
    });
  });
});

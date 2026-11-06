import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, candidateProfiles, organisations, organisationMemberships } from "../db/schema/index.js";
import { PasswordService } from "./passwordService.js";
import { SessionService } from "./sessionService.js";
import { auditService } from "./auditService.js";
import { ConflictError, UnauthorizedError, ForbiddenError } from "../errors/AppError.js";
import type {
  RegisterCandidateRequest,
  RegisterEmployerRequest,
  LoginRequest,
  AuthUser,
} from "@proofhire/shared-contracts";

export interface LoginResult {
  user: AuthUser;
  rawToken: string;
  csrfToken: string;
}

export class AuthService {
  /**
   * Helper to generate a URL-safe slug from a string.
   */
  public static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Registers a new candidate account and sets up their initial candidate profile.
   */
  public static async registerCandidate(
    dto: RegisterCandidateRequest
  ): Promise<{ id: string; email: string; fullName: string; role: string }> {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email));

    if (existing.length > 0) {
      throw new ConflictError("An account with this email address already exists");
    }

    const passwordHash = await PasswordService.hashPassword(dto.password);

    const result = await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          email: dto.email,
          fullName: dto.fullName,
          passwordHash,
          role: "CANDIDATE",
          accountStatus: "ACTIVE",
          emailVerified: false,
        })
        .returning();

      if (!newUser) {
        throw new Error("Failed to insert candidate user record");
      }

      await tx.insert(candidateProfiles).values({
        userId: newUser.id,
        visibility: "PUBLIC",
      });

      return {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      };
    });

    await auditService.recordEvent({
      eventType: "AUTH_REGISTER",
      actorId: result.id,
      targetType: "USER",
      targetId: result.id,
      metadata: { role: "CANDIDATE" },
    });

    return result;
  }

  /**
   * Registers a new employer account, creates their initial organization, and assigns them as OWNER.
   */
  public static async registerEmployer(
    dto: RegisterEmployerRequest
  ): Promise<{ id: string; email: string; fullName: string; organizationId: string }> {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email));

    if (existing.length > 0) {
      throw new ConflictError("An account with this email address already exists");
    }

    const baseSlug = dto.organizationSlug || this.slugify(dto.organizationName);
    let uniqueSlug = baseSlug;

    // Check slug collision
    const existingOrg = await db
      .select({ id: organisations.id })
      .from(organisations)
      .where(eq(organisations.slug, uniqueSlug));

    if (existingOrg.length > 0) {
      uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    const passwordHash = await PasswordService.hashPassword(dto.password);

    const result = await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          email: dto.email,
          fullName: dto.fullName,
          passwordHash,
          role: "EMPLOYER",
          accountStatus: "ACTIVE",
          emailVerified: false,
        })
        .returning();

      if (!newUser) {
        throw new Error("Failed to insert employer user record");
      }

      const [newOrg] = await tx
        .insert(organisations)
        .values({
          name: dto.organizationName,
          slug: uniqueSlug,
          verified: false,
        })
        .returning();

      if (!newOrg) {
        throw new Error("Failed to insert organisation record");
      }

      await tx.insert(organisationMemberships).values({
        userId: newUser.id,
        organisationId: newOrg.id,
        orgRole: "OWNER",
        acceptedAt: new Date(),
      });

      return {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        organizationId: newOrg.id,
      };
    });

    await auditService.recordEvent({
      eventType: "AUTH_REGISTER",
      actorId: result.id,
      targetType: "USER",
      targetId: result.id,
      metadata: { role: "EMPLOYER", organizationId: result.organizationId },
    });

    return result;
  }

  /**
   * Validates user credentials, ensures account is not suspended, and creates a secure session.
   */
  public static async login(
    dto: LoginRequest,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<LoginResult> {
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    if (!userRecord) {
      // Mitigate login enumeration timing attacks by executing dummy hash computation
      await PasswordService.verifyPassword(
        PasswordService.DUMMY_HASH,
        dto.password
      );

      await auditService.recordEvent({
        eventType: "AUTH_LOGIN_FAILURE",
        actorId: null,
        targetType: "USER",
        metadata: { email: dto.email, reason: "USER_NOT_FOUND" },
        ipAddress: metadata?.ipAddress,
      });
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordValid = await PasswordService.verifyPassword(
      userRecord.passwordHash,
      dto.password
    );

    if (!passwordValid) {
      await auditService.recordEvent({
        eventType: "AUTH_LOGIN_FAILURE",
        actorId: userRecord.id,
        targetType: "USER",
        targetId: userRecord.id,
        metadata: { reason: "INVALID_PASSWORD" },
        ipAddress: metadata?.ipAddress,
      });
      throw new UnauthorizedError("Invalid email or password");
    }

    if (userRecord.accountStatus === "BANNED" || userRecord.accountStatus === "SUSPENDED") {
      throw new ForbiddenError(
        `Account access restricted. Status: ${userRecord.accountStatus}`
      );
    }

    // Create session in DB
    const { rawToken } = await SessionService.createSession(userRecord.id, metadata);
    const csrfToken = SessionService.generateCsrfToken();

    // Retrieve user session payload
    const sessionWithUser = await SessionService.validateSession(rawToken);
    if (!sessionWithUser) {
      throw new Error("Failed to load authenticated user state");
    }

    await auditService.recordEvent({
      eventType: "AUTH_LOGIN_SUCCESS",
      actorId: userRecord.id,
      targetType: "USER",
      targetId: userRecord.id,
      metadata: { role: userRecord.role },
      ipAddress: metadata?.ipAddress,
    });

    return {
      user: sessionWithUser.user,
      rawToken,
      csrfToken,
    };
  }

  /**
   * Terminates the session by revoking the token.
   */
  public static async logout(rawToken: string, actorId?: string): Promise<void> {
    await SessionService.revokeSession(rawToken);
    if (actorId) {
      await auditService.recordEvent({
        eventType: "AUTH_LOGOUT",
        actorId,
        targetType: "USER",
        targetId: actorId,
      });
    }
  }
}

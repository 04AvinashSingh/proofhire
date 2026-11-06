import crypto from "crypto";
import { eq, and, gt } from "drizzle-orm";
import { db } from "../db/index.js";
import { sessions, users, candidateProfiles, organisations, organisationMemberships } from "../db/schema/index.js";
import type { Session } from "../db/schema/index.js";
import type { AuthUser } from "@proofhire/shared-contracts";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface SessionWithUser {
  session: Session;
  user: AuthUser;
}

export class SessionService {
  /**
   * Hashes a raw session token with SHA-256 for persistent database storage.
   * Raw tokens are never stored in the database.
   */
  public static hashToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  /**
   * Generates a cryptographically secure random session token.
   */
  public static generateRawToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Generates a cryptographically secure random CSRF token.
   */
  public static generateCsrfToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Creates a new session in the database for the specified user and returns the raw token.
   */
  public static async createSession(
    userId: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ rawToken: string; session: Session }> {
    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    const [session] = await db
      .insert(sessions)
      .values({
        userId,
        tokenHash,
        expiresAt,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      })
      .returning();

    if (!session) {
      throw new Error("Failed to create session record");
    }

    return { rawToken, session };
  }

  /**
   * Validates a raw session token, checks expiry, and retrieves user + organization details.
   */
  public static async validateSession(rawToken: string): Promise<SessionWithUser | null> {
    if (!rawToken || typeof rawToken !== "string") {
      return null;
    }

    const tokenHash = this.hashToken(rawToken);
    const now = new Date();

    // Query session with valid expiration
    const [sessionRecord] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)));

    if (!sessionRecord) {
      return null;
    }

    // Query user
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionRecord.userId));

    if (!userRecord || userRecord.accountStatus === "BANNED" || userRecord.accountStatus === "SUSPENDED") {
      return null;
    }

    // Retrieve candidate profile if user is a CANDIDATE
    let candidateProfileId: string | undefined;
    if (userRecord.role === "CANDIDATE") {
      const [profile] = await db
        .select({ id: candidateProfiles.id })
        .from(candidateProfiles)
        .where(eq(candidateProfiles.userId, userRecord.id));
      candidateProfileId = profile?.id;
    }

    // Retrieve organizations if user is an EMPLOYER or ADMIN
    const orgMemberships = await db
      .select({
        id: organisations.id,
        name: organisations.name,
        slug: organisations.slug,
        role: organisationMemberships.orgRole,
      })
      .from(organisationMemberships)
      .innerJoin(organisations, eq(organisationMemberships.organisationId, organisations.id))
      .where(eq(organisationMemberships.userId, userRecord.id));

    const authUser: AuthUser = {
      id: userRecord.id,
      email: userRecord.email,
      fullName: userRecord.fullName,
      role: userRecord.role as any,
      emailVerified: userRecord.emailVerified,
      accountStatus: userRecord.accountStatus as any,
      createdAt: userRecord.createdAt.toISOString(),
      candidateProfileId,
      organizations: orgMemberships.map((m) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        role: m.role as any,
      })),
    };

    return {
      session: sessionRecord,
      user: authUser,
    };
  }

  /**
   * Revokes a session by deleting its record from the database.
   */
  public static async revokeSession(rawToken: string): Promise<void> {
    if (!rawToken) return;
    const tokenHash = this.hashToken(rawToken);
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }

  /**
   * Revokes all sessions belonging to a specific user (on password reset or account suspension).
   */
  public static async revokeAllUserSessions(userId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }
}

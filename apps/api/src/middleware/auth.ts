import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { SessionService } from "../services/sessionService.js";
import { UnauthorizedError, ForbiddenError } from "../errors/AppError.js";
import type { AuthUser, UserRole } from "@proofhire/shared-contracts";
import type { Session } from "../db/schema/index.js";

export const SESSION_COOKIE_NAME = "proofhire_session";
export const CSRF_COOKIE_NAME = "proofhire_csrf";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      session?: Session;
      rawSessionToken?: string;
    }
  }
}

/**
 * Sets HttpOnly session cookie and client-readable CSRF cookie.
 */
export function setAuthCookies(
  res: Response,
  rawToken: string,
  csrfToken: string
): void {
  const isProduction = env.NODE_ENV === "production";
  const maxAge = 2 * 60 * 60 * 1000; // 2 hours

  // HttpOnly, Secure, SameSite=Strict session cookie (ADR-004)
  res.cookie(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge,
  });

  // Non-HttpOnly CSRF token cookie for double-submit verification
  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge,
  });
}

/**
 * Clears authentication cookies upon logout.
 */
export function clearAuthCookies(res: Response): void {
  const isProduction = env.NODE_ENV === "production";

  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
  });

  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
  });
}

/**
 * Middleware ensuring request is authenticated via HttpOnly cookie or Bearer token.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token = req.cookies?.[SESSION_COOKIE_NAME];

    // Fallback to Bearer token for programmatic API clients or automated tests
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.slice(7).trim();
    }

    if (!token) {
      throw new UnauthorizedError("Authentication required. Missing session cookie.");
    }

    const sessionWithUser = await SessionService.validateSession(token);

    if (!sessionWithUser) {
      clearAuthCookies(res);
      throw new UnauthorizedError("Invalid or expired session");
    }

    req.user = sessionWithUser.user;
    req.session = sessionWithUser.session;
    req.rawSessionToken = token;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware that populates req.user if session cookie is present, but doesn't fail if absent.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token = req.cookies?.[SESSION_COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.slice(7).trim();
    }

    if (token) {
      const sessionWithUser = await SessionService.validateSession(token);
      if (sessionWithUser) {
        req.user = sessionWithUser.user;
        req.session = sessionWithUser.session;
        req.rawSessionToken = token;
      }
    }
  } catch {
    // Proceed unauthenticated
  }
  next();
}

/**
 * Middleware restricting endpoint access to specific roles (RBAC).
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access restricted to roles: [${allowedRoles.join(", ")}]. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
}

/**
 * Middleware verifying double-submit CSRF cookie token on state-changing requests.
 */
export function requireCsrf(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const stateChangingMethods = ["POST", "PUT", "PATCH", "DELETE"];

  if (!stateChangingMethods.includes(req.method)) {
    return next();
  }

  // Exempt auth bootstrap endpoints (register and login) from CSRF check
  if (req.path.startsWith("/api/v1/auth/register") || req.path === "/api/v1/auth/login") {
    return next();
  }

  const cookieCsrf = req.cookies?.[CSRF_COOKIE_NAME];
  const headerCsrf =
    (req.headers["x-csrf-token"] as string) || (req.headers["x-xsrf-token"] as string);

  if (!cookieCsrf || !headerCsrf) {
    return next(new ForbiddenError("CSRF verification failed: token mismatch or missing"));
  }

  const cookieBuf = Buffer.from(cookieCsrf);
  const headerBuf = Buffer.from(headerCsrf);

  if (cookieBuf.length !== headerBuf.length || !crypto.timingSafeEqual(cookieBuf, headerBuf)) {
    return next(new ForbiddenError("CSRF verification failed: token mismatch or missing"));
  }

  next();
}

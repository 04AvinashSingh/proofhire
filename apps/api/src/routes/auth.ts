import { Router, Request, Response, NextFunction } from "express";
import {
  RegisterCandidateRequestSchema,
  RegisterEmployerRequestSchema,
  LoginRequestSchema,
} from "@proofhire/shared-contracts";
import { AuthService } from "../services/authService.js";
import { validateRequest } from "../middleware/validate.js";
import {
  requireAuth,
  setAuthCookies,
  clearAuthCookies,
  SESSION_COOKIE_NAME,
} from "../middleware/auth.js";
import {
  loginRateLimiter,
  registerRateLimiter,
} from "../middleware/rateLimiter.js";

const router = Router();

/**
 * POST /api/v1/auth/register/candidate
 * Registers a new candidate account.
 */
router.post(
  "/register/candidate",
  registerRateLimiter,
  validateRequest({ body: RegisterCandidateRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.registerCandidate(req.body);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/auth/register/employer
 * Registers a new employer account and their initial organization.
 */
router.post(
  "/register/employer",
  registerRateLimiter,
  validateRequest({ body: RegisterEmployerRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.registerEmployer(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/auth/login
 * Validates credentials and sets HttpOnly session + CSRF cookies.
 */
router.post(
  "/login",
  loginRateLimiter,
  validateRequest({ body: LoginRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const metadata = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get("user-agent"),
      };

      const { user, rawToken, csrfToken } = await AuthService.login(
        req.body,
        metadata
      );

      // Set HttpOnly, Secure, SameSite=Strict cookie (ADR-004)
      setAuthCookies(res, rawToken, csrfToken);

      res.status(200).json({
        success: true,
        data: {
          user,
          csrfToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/auth/logout
 * Revokes current session and clears authentication cookies.
 */
router.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let rawToken = req.cookies?.[SESSION_COOKIE_NAME];
      if (!rawToken && req.headers.authorization?.startsWith("Bearer ")) {
        rawToken = req.headers.authorization.slice(7).trim();
      }

      if (rawToken) {
        await AuthService.logout(rawToken);
      }

      clearAuthCookies(res);

      res.status(200).json({
        success: true,
        data: { message: "Successfully logged out" },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/auth/me
 * Retrieves current authenticated user profile and memberships.
 */
router.get(
  "/me",
  requireAuth,
  async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  }
);

export const authRouter = router;

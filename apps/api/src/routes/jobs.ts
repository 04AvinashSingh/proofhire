import { Router, Request, Response, NextFunction } from "express";
import {
  CreateJobRequestSchema,
  UpdateJobRequestSchema,
  JobSearchQuerySchema,
} from "@proofhire/shared-contracts";
import { JobService } from "../services/jobService.js";
import { validateRequest } from "../middleware/validate.js";
import { requireAuth, requireRole, requireCsrf, optionalAuth } from "../middleware/auth.js";

const router = Router();

/**
 * Public Job Search & Discovery
 * GET /api/v1/jobs
 */
router.get(
  "/",
  validateRequest({ query: JobSearchQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await JobService.searchPublishedJobs(req.query as any);
      res.status(200).json({
        success: true,
        data: results.jobs,
        meta: {
          total: results.total,
          page: results.page,
          limit: results.limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Public Single Job View (Published only for public, draft viewable by org members)
 * GET /api/v1/jobs/:jobId
 */
router.get(
  "/:jobId",
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const job = await JobService.getJobById(req.params.jobId!, req.user);
      res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const jobsRouter = router;

// Organization-scoped jobs router
const orgJobsRouter = Router({ mergeParams: true });

/**
 * Employer creates a job in the organization (starts in DRAFT)
 * POST /api/v1/organisations/:orgId/jobs
 */
orgJobsRouter.post(
  "/",
  requireAuth,
  requireRole("EMPLOYER"),
  requireCsrf,
  validateRequest({ body: CreateJobRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isPlatformAdmin = req.user?.role === "ADMIN";
      const created = await JobService.createJob(
        req.params.orgId!,
        req.user!.id,
        req.body,
        isPlatformAdmin
      );
      res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Employer lists all jobs in the organization (DRAFT, PUBLISHED, CLOSED)
 * GET /api/v1/organisations/:orgId/jobs
 */
orgJobsRouter.get(
  "/",
  requireAuth,
  requireRole("EMPLOYER"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isPlatformAdmin = req.user?.role === "ADMIN";
      const list = await JobService.getOrganizationJobs(
        req.params.orgId!,
        req.user!.id,
        isPlatformAdmin
      );
      res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Employer updates a job (details, requirements, or status)
 * PATCH /api/v1/organisations/:orgId/jobs/:jobId
 */
orgJobsRouter.patch(
  "/:jobId",
  requireAuth,
  requireRole("EMPLOYER"),
  requireCsrf,
  validateRequest({ body: UpdateJobRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isPlatformAdmin = req.user?.role === "ADMIN";
      const updated = await JobService.updateJob(
        req.params.jobId!,
        req.params.orgId!,
        req.user!.id,
        req.body,
        isPlatformAdmin
      );
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const orgJobsSubRouter = orgJobsRouter;

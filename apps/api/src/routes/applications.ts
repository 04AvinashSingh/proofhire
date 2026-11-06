import { Router, Request, Response, NextFunction } from "express";
import {
  ApplyToJobRequestSchema,
  UpdateApplicationStatusRequestSchema,
  CreateEvaluationNoteRequestSchema,
} from "@proofhire/shared-contracts";
import { ApplicationService } from "../services/applicationService.js";
import { validateRequest } from "../middleware/validate.js";
import { requireAuth, requireRole, requireCsrf } from "../middleware/auth.js";

export const applicationsRouter = Router();

/**
 * Candidate applies to a published job
 * POST /api/v1/jobs/:jobId/apply
 */
applicationsRouter.post(
  "/jobs/:jobId/apply",
  requireAuth,
  requireRole("CANDIDATE"),
  requireCsrf,
  validateRequest({ body: ApplyToJobRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await ApplicationService.applyToJob(
        req.params.jobId!,
        req.user!.id,
        req.body
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
 * Candidate lists their own applications with transparent Anti-Ghosting SLA tracking
 * GET /api/v1/candidates/applications
 */
applicationsRouter.get(
  "/candidates/applications",
  requireAuth,
  requireRole("CANDIDATE"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await ApplicationService.getCandidateApplications(req.user!.id);
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
 * Employer lists applications for a job in the organization
 * GET /api/v1/organisations/:orgId/jobs/:jobId/applications
 */
applicationsRouter.get(
  "/organisations/:orgId/jobs/:jobId/applications",
  requireAuth,
  requireRole("EMPLOYER"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isPlatformAdmin = req.user?.role === "ADMIN";
      const list = await ApplicationService.getEmployerJobApplications(
        req.params.jobId!,
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
 * Employer views full application details (candidate profile, evidence mappings, history, notes)
 * GET /api/v1/organisations/:orgId/applications/:appId
 */
applicationsRouter.get(
  "/organisations/:orgId/applications/:appId",
  requireAuth,
  requireRole("EMPLOYER"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isPlatformAdmin = req.user?.role === "ADMIN";
      const detail = await ApplicationService.getEmployerApplicationDetail(
        req.params.appId!,
        req.params.orgId!,
        req.user!.id,
        isPlatformAdmin
      );
      res.status(200).json({
        success: true,
        data: detail,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Employer transitions application status via state machine
 * PATCH /api/v1/organisations/:orgId/applications/:appId/status
 */
applicationsRouter.patch(
  "/organisations/:orgId/applications/:appId/status",
  requireAuth,
  requireRole("EMPLOYER"),
  requireCsrf,
  validateRequest({ body: UpdateApplicationStatusRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isPlatformAdmin = req.user?.role === "ADMIN";
      const updated = await ApplicationService.transitionStatus(
        req.params.appId!,
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

/**
 * Employer records private evaluation note
 * POST /api/v1/organisations/:orgId/applications/:appId/notes
 */
applicationsRouter.post(
  "/organisations/:orgId/applications/:appId/notes",
  requireAuth,
  requireRole("EMPLOYER"),
  requireCsrf,
  validateRequest({ body: CreateEvaluationNoteRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isPlatformAdmin = req.user?.role === "ADMIN";
      const savedNote = await ApplicationService.addEvaluationNote(
        req.params.appId!,
        req.params.orgId!,
        req.user!.id,
        req.body,
        isPlatformAdmin
      );
      res.status(201).json({
        success: true,
        data: savedNote,
      });
    } catch (error) {
      next(error);
    }
  }
);

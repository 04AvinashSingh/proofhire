import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { aiAssessmentService } from "../services/aiAssessmentService.js";
import { aiServiceClient } from "../services/aiServiceClient.js";
import { VerifyEvidenceRequestSchema } from "@proofhire/shared-contracts";

const aiRouter = Router();

/**
 * POST /api/v1/applications/:id/ai-assessment
 * Generates AI-assisted grounded relevance explanations for an application.
 * Strictly employer-only and tenant-isolated.
 */
aiRouter.post(
  "/applications/:id/ai-assessment",
  requireAuth,
  requireRole("EMPLOYER", "ADMIN"),
  async (req, res, next) => {
    try {
      const applicationId = req.params.id as string;
      const targetRequirementId = req.query.requirementId as string | undefined;

      const result = await aiAssessmentService.assessApplication(
        applicationId,
        req.user!.id,
        targetRequirementId
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/v1/applications/:id/ai-assessment
 * Retrieves existing AI assessments for an application.
 * Strictly employer-only.
 */
aiRouter.get(
  "/applications/:id/ai-assessment",
  requireAuth,
  requireRole("EMPLOYER", "ADMIN"),
  async (req, res, next) => {
    try {
      const applicationId = req.params.id as string;
      const assessments = await aiAssessmentService.getApplicationAssessments(
        applicationId,
        req.user!.id
      );

      res.json({
        success: true,
        data: assessments,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/evidence/verify
 * Independent verification check for candidate evidence (GitHub repo, commit hash, artifact).
 */
aiRouter.post(
  "/evidence/verify",
  requireAuth,
  validateRequest({ body: VerifyEvidenceRequestSchema }),
  async (req, res, next) => {
    try {
      const result = await aiServiceClient.verifyEvidence(req.body);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

export { aiRouter };

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  UpdateCandidateProfileRequestSchema,
  AddSkillRequestSchema,
  AddEducationRequestSchema,
  AddExperienceRequestSchema,
  CreateProjectRequestSchema,
  AddProjectEvidenceRequestSchema,
} from "@proofhire/shared-contracts";
import { CandidateProfileService } from "../services/candidateProfileService.js";
import { ProjectService } from "../services/projectService.js";
import { PortfolioService } from "../services/portfolioService.js";
import { storageService } from "../services/storageService.js";
import { validateRequest } from "../middleware/validate.js";
import { requireAuth, requireRole, requireCsrf, optionalAuth } from "../middleware/auth.js";


const router = Router();

// Helper to extract candidate profile ID from authenticated candidate user
async function getCandidateId(userId: string): Promise<string> {
  const profile = await CandidateProfileService.getProfileByUserId(userId);
  return profile.id;
}

/**
 * GET /api/v1/candidates/profile
 * Retrieves profile of the currently authenticated candidate.
 */
router.get(
  "/profile",
  requireAuth,
  requireRole("CANDIDATE"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await CandidateProfileService.getProfileByUserId(req.user!.id);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/v1/candidates/profile
 * Updates profile fields (bio, location, status, visibility, yearsExperience).
 */
router.patch(
  "/profile",
  requireAuth,
  requireRole("CANDIDATE"),
  requireCsrf,
  validateRequest({ body: UpdateCandidateProfileRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await CandidateProfileService.updateProfile(
        req.user!.id,
        req.body
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
 * Skills Endpoints
 */
router.get(
  "/skills",
  requireAuth,
  requireRole("CANDIDATE"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      const skills = await CandidateProfileService.getSkills(candidateId);
      res.status(200).json({
        success: true,
        data: skills,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/skills",
  requireAuth,
  requireRole("CANDIDATE"),
  requireCsrf,
  validateRequest({ body: AddSkillRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      const skill = await CandidateProfileService.addSkill(candidateId, req.body);
      res.status(201).json({
        success: true,
        data: skill,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/skills/:skillId",
  requireAuth,
  requireRole("CANDIDATE"),
  requireCsrf,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      await CandidateProfileService.deleteSkill(candidateId, req.params.skillId!);
      res.status(200).json({
        success: true,
        data: { message: "Skill removed from profile" },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Education Endpoints
 */
router.get(
  "/education",
  requireAuth,
  requireRole("CANDIDATE"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      const edu = await CandidateProfileService.getEducation(candidateId);
      res.status(200).json({ success: true, data: edu });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/education",
  requireAuth,
  requireRole("CANDIDATE"),
  requireCsrf,
  validateRequest({ body: AddEducationRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      const edu = await CandidateProfileService.addEducation(candidateId, req.body);
      res.status(201).json({ success: true, data: edu });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/education/:id",
  requireAuth,
  requireRole("CANDIDATE"),
  requireCsrf,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      await CandidateProfileService.deleteEducation(candidateId, req.params.id!);
      res.status(200).json({ success: true, data: { message: "Education entry deleted" } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Experience Endpoints
 */
router.get(
  "/experience",
  requireAuth,
  requireRole("CANDIDATE"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      const exp = await CandidateProfileService.getExperience(candidateId);
      res.status(200).json({ success: true, data: exp });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/experience",
  requireAuth,
  requireRole("CANDIDATE"),
  requireCsrf,
  validateRequest({ body: AddExperienceRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      const exp = await CandidateProfileService.addExperience(candidateId, req.body);
      res.status(201).json({ success: true, data: exp });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/experience/:id",
  requireAuth,
  requireRole("CANDIDATE"),
  requireCsrf,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      await CandidateProfileService.deleteExperience(candidateId, req.params.id!);
      res.status(200).json({ success: true, data: { message: "Experience entry deleted" } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Projects Endpoints
 */
router.get(
  "/projects",
  requireAuth,
  requireRole("CANDIDATE"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      const projects = await ProjectService.getProjects(candidateId);
      res.status(200).json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/projects",
  requireAuth,
  requireRole("CANDIDATE"),
  requireCsrf,
  validateRequest({ body: CreateProjectRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      const project = await ProjectService.createProject(candidateId, req.body);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/projects/:projectId",
  requireAuth,
  requireRole("CANDIDATE"),
  requireCsrf,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      await ProjectService.deleteProject(candidateId, req.params.projectId!);
      res.status(200).json({ success: true, data: { message: "Project deleted" } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Project Evidence Endpoints
 */
router.post(
  "/projects/:projectId/evidence",
  requireAuth,
  requireRole("CANDIDATE"),
  requireCsrf,
  validateRequest({ body: AddProjectEvidenceRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      const evidence = await ProjectService.addEvidence(
        candidateId,
        req.params.projectId!,
        req.body
      );
      res.status(201).json({ success: true, data: evidence });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/projects/:projectId/evidence/:evidenceId",
  requireAuth,
  requireRole("CANDIDATE"),
  requireCsrf,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = await getCandidateId(req.user!.id);
      await ProjectService.deleteEvidence(
        candidateId,
        req.params.projectId!,
        req.params.evidenceId!
      );
      res.status(200).json({ success: true, data: { message: "Evidence deleted" } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Artifact Upload Endpoint
 * Supports JSON base64 upload with strict MIME type checking (ADR-006).
 */
const UploadPayloadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string(),
  base64Data: z.string().min(1),
});

router.post(
  "/artifacts/upload",
  requireAuth,
  requireRole("CANDIDATE"),
  requireCsrf,
  validateRequest({ body: UploadPayloadSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileName, mimeType, base64Data } = req.body;
      const buffer = Buffer.from(base64Data, "base64");

      const saved = await storageService.saveFile(
        fileName,
        buffer,
        mimeType,
        req.user?.id
      );

      res.status(201).json({
        success: true,
        data: {
          fileName: saved.fileName,
          size: saved.size,
          filePath: saved.filePath,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Public & Employer Portfolio View
 * GET /api/v1/candidates/portfolio/:candidateId
 */
router.get(
  "/portfolio/:candidateId",
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const portfolio = await PortfolioService.getPortfolio(
        req.params.candidateId!,
        req.user
      );
      res.status(200).json({
        success: true,
        data: portfolio,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const candidatesRouter = router;

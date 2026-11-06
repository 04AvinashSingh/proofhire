import { Router, Request, Response, NextFunction } from "express";
import {
  CreateOrganizationRequestSchema,
  InviteMemberRequestSchema,
} from "@proofhire/shared-contracts";
import { OrganizationService } from "../services/organizationService.js";
import { validateRequest } from "../middleware/validate.js";
import { requireAuth, requireRole, requireCsrf } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/v1/organisations
 * Creates a new organization. Restriced to EMPLOYER or ADMIN roles.
 */
router.post(
  "/",
  requireAuth,
  requireRole("EMPLOYER", "ADMIN"),
  requireCsrf,
  validateRequest({ body: CreateOrganizationRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const org = await OrganizationService.createOrganization(
        req.user!.id,
        req.body
      );
      res.status(201).json({
        success: true,
        data: org,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/organisations/:orgId
 * Retrieves organization details with strict cross-tenant isolation.
 */
router.get(
  "/:orgId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isPlatformAdmin = req.user!.role === "ADMIN";
      const org = await OrganizationService.getOrganizationById(
        req.params.orgId!,
        req.user!.id,
        isPlatformAdmin
      );
      res.status(200).json({
        success: true,
        data: org,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/organisations/:orgId/members
 * Lists organization members with strict cross-tenant isolation.
 */
router.get(
  "/:orgId/members",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isPlatformAdmin = req.user!.role === "ADMIN";
      const members = await OrganizationService.getMembers(
        req.params.orgId!,
        req.user!.id,
        isPlatformAdmin
      );
      res.status(200).json({
        success: true,
        data: members,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/organisations/:orgId/members/invite
 * Invites a user to the organization. Restricted to OWNER or ADMIN members of that org.
 */
router.post(
  "/:orgId/members/invite",
  requireAuth,
  requireRole("EMPLOYER", "ADMIN"),
  requireCsrf,
  validateRequest({ body: InviteMemberRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isPlatformAdmin = req.user!.role === "ADMIN";
      const membership = await OrganizationService.inviteMember(
        req.params.orgId!,
        req.user!.id,
        req.body,
        isPlatformAdmin
      );
      res.status(201).json({
        success: true,
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const organisationsRouter = router;

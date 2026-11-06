import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { organisations, organisationMemberships, users } from "../db/schema/index.js";
import { AuthService } from "./authService.js";
import { NotFoundError, ForbiddenError, ConflictError } from "../errors/AppError.js";
import type {
  CreateOrganizationRequest,
  InviteMemberRequest,
} from "@proofhire/shared-contracts";

export class OrganizationService {
  /**
   * Creates a new organization and assigns the creator as OWNER.
   */
  public static async createOrganization(
    userId: string,
    dto: CreateOrganizationRequest
  ) {
    const baseSlug = dto.slug || AuthService.slugify(dto.name);
    let uniqueSlug = baseSlug;

    const existingSlug = await db
      .select({ id: organisations.id })
      .from(organisations)
      .where(eq(organisations.slug, uniqueSlug));

    if (existingSlug.length > 0) {
      uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    return await db.transaction(async (tx) => {
      const [newOrg] = await tx
        .insert(organisations)
        .values({
          name: dto.name,
          slug: uniqueSlug,
          website: dto.website || null,
          description: dto.description || null,
          sizeRange: dto.sizeRange || null,
          industry: dto.industry || null,
          verified: false,
        })
        .returning();

      if (!newOrg) {
        throw new Error("Failed to create organisation");
      }

      await tx.insert(organisationMemberships).values({
        organisationId: newOrg.id,
        userId,
        orgRole: "OWNER",
        acceptedAt: new Date(),
      });

      return newOrg;
    });
  }

  /**
   * Retrieves organization details after verifying tenant isolation.
   * Cross-tenant isolation invariant: an employer cannot view another organization's private data.
   */
  public static async getOrganizationById(
    orgId: string,
    requestingUserId: string,
    isPlatformAdmin = false
  ) {
    const [org] = await db
      .select()
      .from(organisations)
      .where(eq(organisations.id, orgId));

    if (!org) {
      throw new NotFoundError("Organization not found");
    }

    // Platform ADMINs have global read access
    if (isPlatformAdmin) {
      return org;
    }

    // Check membership for tenant isolation
    const [membership] = await db
      .select()
      .from(organisationMemberships)
      .where(
        and(
          eq(organisationMemberships.organisationId, orgId),
          eq(organisationMemberships.userId, requestingUserId)
        )
      );

    if (!membership) {
      throw new ForbiddenError("You do not have access to this organization");
    }

    return {
      ...org,
      userRole: membership.orgRole,
    };
  }

  /**
   * Lists all members of an organization after verifying tenant isolation.
   */
  public static async getMembers(
    orgId: string,
    requestingUserId: string,
    isPlatformAdmin = false
  ) {
    await this.getOrganizationById(orgId, requestingUserId, isPlatformAdmin);

    const members = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        orgRole: organisationMemberships.orgRole,
        acceptedAt: organisationMemberships.acceptedAt,
        createdAt: organisationMemberships.createdAt,
      })
      .from(organisationMemberships)
      .innerJoin(users, eq(organisationMemberships.userId, users.id))
      .where(eq(organisationMemberships.organisationId, orgId));

    return members;
  }

  /**
   * Invites an existing registered user to an organization.
   * Only OWNER and ADMIN members can invite new members.
   */
  public static async inviteMember(
    orgId: string,
    inviterUserId: string,
    dto: InviteMemberRequest,
    isPlatformAdmin = false
  ) {
    if (!isPlatformAdmin) {
      const [inviterMembership] = await db
        .select()
        .from(organisationMemberships)
        .where(
          and(
            eq(organisationMemberships.organisationId, orgId),
            eq(organisationMemberships.userId, inviterUserId)
          )
        );

      if (!inviterMembership || (inviterMembership.orgRole !== "OWNER" && inviterMembership.orgRole !== "ADMIN")) {
        throw new ForbiddenError(
          "Only organization Owners and Admins can invite new members"
        );
      }
    }

    // Find the invited user
    const [invitedUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    if (!invitedUser) {
      throw new NotFoundError(
        "User not found with this email. Users must be registered before being invited."
      );
    }

    // Check if user is already a member
    const [existingMember] = await db
      .select()
      .from(organisationMemberships)
      .where(
        and(
          eq(organisationMemberships.organisationId, orgId),
          eq(organisationMemberships.userId, invitedUser.id)
        )
      );

    if (existingMember) {
      throw new ConflictError("User is already a member of this organization");
    }

    const [newMembership] = await db
      .insert(organisationMemberships)
      .values({
        organisationId: orgId,
        userId: invitedUser.id,
        orgRole: dto.role,
        invitedBy: inviterUserId,
        acceptedAt: new Date(),
      })
      .returning();

    return newMembership;
  }
}

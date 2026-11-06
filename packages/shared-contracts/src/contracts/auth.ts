import { z } from "zod";
import { UserRoleSchema, AccountStatusSchema, OrgRoleSchema } from "../common/roles.js";

export const RegisterCandidateRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
});

export type RegisterCandidateRequest = z.infer<typeof RegisterCandidateRequestSchema>;

export const RegisterEmployerRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  organizationName: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name cannot exceed 100 characters"),
  organizationSlug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
});

export type RegisterEmployerRequest = z.infer<typeof RegisterEmployerRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthOrganizationSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  role: OrgRoleSchema,
});

export type AuthOrganizationSummary = z.infer<typeof AuthOrganizationSummarySchema>;

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  role: UserRoleSchema,
  emailVerified: z.boolean(),
  accountStatus: AccountStatusSchema,
  createdAt: z.string().datetime(),
  candidateProfileId: z.string().uuid().optional(),
  organizations: z.array(AuthOrganizationSummarySchema),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const CreateOrganizationRequestSchema = z.object({
  name: z.string().trim().min(2, "Organization name must be at least 2 characters").max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  website: z.string().trim().url("Invalid website URL").optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional(),
  sizeRange: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
  industry: z.string().trim().max(100).optional(),
});

export type CreateOrganizationRequest = z.infer<typeof CreateOrganizationRequestSchema>;

export const InviteMemberRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  role: OrgRoleSchema,
});

export type InviteMemberRequest = z.infer<typeof InviteMemberRequestSchema>;

export const SessionResponseSchema = z.object({
  user: AuthUserSchema,
  csrfToken: z.string(),
});

export type SessionResponse = z.infer<typeof SessionResponseSchema>;

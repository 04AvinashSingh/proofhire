import { z } from "zod";

export const UserRoleSchema = z.enum(["CANDIDATE", "EMPLOYER", "ADMIN"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const AccountStatusSchema = z.enum(["ACTIVE", "WARNED", "SUSPENDED", "BANNED"]);
export type AccountStatus = z.infer<typeof AccountStatusSchema>;

export const OrgRoleSchema = z.enum(["OWNER", "ADMIN", "MEMBER"]);
export type OrgRole = z.infer<typeof OrgRoleSchema>;

export const CandidateStatusSchema = z.enum([
  "STUDENT",
  "ACTIVELY_LOOKING",
  "OPEN",
  "NOT_LOOKING",
]);
export type CandidateStatus = z.infer<typeof CandidateStatusSchema>;

export const CandidateVisibilitySchema = z.enum([
  "PUBLIC",
  "APPLIED_ONLY",
  "PRIVATE",
]);
export type CandidateVisibility = z.infer<typeof CandidateVisibilitySchema>;

import { z } from "zod";

export const JobStatusSchema = z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]);
export type JobStatus = z.infer<typeof JobStatusSchema>;

export const EmploymentTypeSchema = z.enum([
  "FULL_TIME",
  "INTERNSHIP",
  "CONTRACT",
  "PART_TIME",
]);
export type EmploymentType = z.infer<typeof EmploymentTypeSchema>;

export const RemoteTypeSchema = z.enum(["ONSITE", "REMOTE", "HYBRID"]);
export type RemoteType = z.infer<typeof RemoteTypeSchema>;

export const RequirementImportanceSchema = z.enum(["REQUIRED", "PREFERRED"]);
export type RequirementImportance = z.infer<typeof RequirementImportanceSchema>;

// Requirement Schema
export const JobRequirementInputSchema = z.object({
  requirementText: z
    .string()
    .trim()
    .min(3, "Requirement must be at least 3 characters")
    .max(500),
  importance: RequirementImportanceSchema.default("REQUIRED"),
  evidenceTypeHint: z.string().trim().max(300).optional().nullable(),
  skillTags: z.array(z.string().trim()).default([]),
  sortOrder: z.number().int().default(0),
});
export type JobRequirementInput = z.infer<typeof JobRequirementInputSchema>;

export const JobRequirementDtoSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  requirementText: z.string(),
  importance: RequirementImportanceSchema,
  evidenceTypeHint: z.string().nullable(),
  skillTags: z.array(z.string()).nullable(),
  sortOrder: z.number(),
  createdAt: z.string(),
});
export type JobRequirementDto = z.infer<typeof JobRequirementDtoSchema>;

// Job Create Request
export const CreateJobRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000),
  employmentType: EmploymentTypeSchema.default("FULL_TIME"),
  locationCity: z.string().trim().max(100).optional().nullable(),
  locationCountry: z.string().trim().max(100).optional().nullable(),
  remoteType: RemoteTypeSchema.default("ONSITE"),
  salaryMin: z.number().int().min(0).optional().nullable(),
  salaryMax: z.number().int().min(0).optional().nullable(),
  salaryCurrency: z.string().trim().default("INR"),
  applicationDeadline: z.string().trim().optional().nullable(),
  requirements: z.array(JobRequirementInputSchema).default([]),
});
export type CreateJobRequest = z.infer<typeof CreateJobRequestSchema>;

// Job Update Request
export const UpdateJobRequestSchema = CreateJobRequestSchema.partial().extend({
  status: JobStatusSchema.optional(),
});
export type UpdateJobRequest = z.infer<typeof UpdateJobRequestSchema>;

// Job DTO
export const JobDtoSchema = z.object({
  id: z.string().uuid(),
  organisationId: z.string().uuid(),
  organisationName: z.string().optional(),
  organisationSlug: z.string().optional(),
  createdBy: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  employmentType: EmploymentTypeSchema,
  locationCity: z.string().nullable(),
  locationCountry: z.string().nullable(),
  remoteType: RemoteTypeSchema,
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  salaryCurrency: z.string().nullable(),
  applicationDeadline: z.string().nullable(),
  status: JobStatusSchema,
  publishedAt: z.string().nullable(),
  closedAt: z.string().nullable(),
  requirements: z.array(JobRequirementDtoSchema),
  applicationCount: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type JobDto = z.infer<typeof JobDtoSchema>;

// Public Search Query DTO
export const JobSearchQuerySchema = z.object({
  keyword: z.string().trim().optional(),
  employmentType: EmploymentTypeSchema.optional(),
  remoteType: RemoteTypeSchema.optional(),
  location: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type JobSearchQuery = z.infer<typeof JobSearchQuerySchema>;

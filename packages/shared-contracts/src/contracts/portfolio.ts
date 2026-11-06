import { z } from "zod";
import { CandidateStatusSchema, CandidateVisibilitySchema } from "../common/roles.js";

export const SkillProficiencySchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
export type SkillProficiency = z.infer<typeof SkillProficiencySchema>;

export const SkillCategorySchema = z.enum(["Languages", "Frameworks", "Databases", "Tools"]);
export type SkillCategory = z.infer<typeof SkillCategorySchema>;

export const ProjectRoleSchema = z.enum([
  "SOLE_DEVELOPER",
  "LEAD",
  "CONTRIBUTOR",
  "REVIEWER",
]);
export type ProjectRole = z.infer<typeof ProjectRoleSchema>;

export const EvidenceTypeSchema = z.enum([
  "URL",
  "GITHUB_URL",
  "UPLOADED_FILE",
  "VIDEO_LINK",
  "WRITTEN_EXPLANATION",
]);
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

// Profile Update DTO
export const UpdateCandidateProfileRequestSchema = z.object({
  bio: z.string().trim().max(500, "Bio cannot exceed 500 characters").optional().nullable(),
  locationCity: z.string().trim().max(100).optional().nullable(),
  locationCountry: z.string().trim().max(100).optional().nullable(),
  status: CandidateStatusSchema.optional().nullable(),
  visibility: CandidateVisibilitySchema.optional(),
  yearsExperience: z.number().int().min(0).max(50).optional().nullable(),
});
export type UpdateCandidateProfileRequest = z.infer<typeof UpdateCandidateProfileRequestSchema>;

// Skill DTOs
export const AddSkillRequestSchema = z.object({
  skillName: z.string().trim().min(1, "Skill name is required").max(50),
  proficiency: SkillProficiencySchema,
  category: SkillCategorySchema.default("Languages"),
});
export type AddSkillRequest = z.infer<typeof AddSkillRequestSchema>;

export const CandidateSkillDtoSchema = z.object({
  id: z.string().uuid(),
  skillName: z.string(),
  proficiency: SkillProficiencySchema,
  category: SkillCategorySchema,
  isSelfReported: z.boolean(),
  createdAt: z.string(),
});
export type CandidateSkillDto = z.infer<typeof CandidateSkillDtoSchema>;

// Education DTOs
export const AddEducationRequestSchema = z.object({
  institution: z.string().trim().min(1, "Institution name is required").max(150),
  degree: z.string().trim().max(100).optional().nullable(),
  fieldOfStudy: z.string().trim().max(100).optional().nullable(),
  startYear: z.number().int().min(1950).max(2050).optional().nullable(),
  endYear: z.number().int().min(1950).max(2050).optional().nullable(),
  description: z.string().trim().max(500).optional().nullable(),
});
export type AddEducationRequest = z.infer<typeof AddEducationRequestSchema>;

export const CandidateEducationDtoSchema = z.object({
  id: z.string().uuid(),
  institution: z.string(),
  degree: z.string().nullable(),
  fieldOfStudy: z.string().nullable(),
  startYear: z.number().nullable(),
  endYear: z.number().nullable(),
  description: z.string().nullable(),
  sortOrder: z.number(),
  createdAt: z.string(),
});
export type CandidateEducationDto = z.infer<typeof CandidateEducationDtoSchema>;

// Experience DTOs
export const AddExperienceRequestSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required").max(100),
  roleTitle: z.string().trim().min(1, "Role title is required").max(100),
  employmentType: z
    .enum(["FULL_TIME", "INTERNSHIP", "FREELANCE", "PART_TIME", "CONTRACT"])
    .optional()
    .nullable(),
  startDate: z.string().trim().min(4, "Start date is required"),
  endDate: z.string().trim().optional().nullable(),
  isCurrent: z.boolean().default(false),
  responsibilities: z.string().trim().max(2000).optional().nullable(),
  technologies: z.array(z.string().trim()).default([]),
});
export type AddExperienceRequest = z.infer<typeof AddExperienceRequestSchema>;

export const CandidateExperienceDtoSchema = z.object({
  id: z.string().uuid(),
  companyName: z.string(),
  roleTitle: z.string(),
  employmentType: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  isCurrent: z.boolean(),
  responsibilities: z.string().nullable(),
  technologies: z.array(z.string()).nullable(),
  sortOrder: z.number(),
  createdAt: z.string(),
});
export type CandidateExperienceDto = z.infer<typeof CandidateExperienceDtoSchema>;

// Project DTOs
export const CreateProjectRequestSchema = z.object({
  name: z.string().trim().min(2, "Project name must be at least 2 characters").max(100),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  roleInProject: ProjectRoleSchema,
  teamSize: z.number().int().min(1).max(100).optional().nullable(),
  personalContribution: z
    .string()
    .trim()
    .min(10, "Please describe your personal contribution in at least 10 characters")
    .max(2000),
  githubUrl: z.string().trim().url("Invalid GitHub URL").optional().nullable().or(z.literal("")),
  projectUrl: z.string().trim().url("Invalid Project URL").optional().nullable().or(z.literal("")),
  demoUrl: z.string().trim().url("Invalid Demo URL").optional().nullable().or(z.literal("")),
  isTeamProject: z.boolean().default(false),
  startDate: z.string().trim().optional().nullable(),
  endDate: z.string().trim().optional().nullable(),
});
export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;

// Evidence DTOs
export const AddProjectEvidenceRequestSchema = z.object({
  evidenceType: EvidenceTypeSchema,
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(100),
  description: z.string().trim().min(5, "Description must be at least 5 characters").max(2000),
  url: z.string().trim().url("Invalid Evidence URL").optional().nullable().or(z.literal("")),
  filePath: z.string().trim().optional().nullable(),
  personalContribution: z
    .string()
    .trim()
    .min(5, "Personal contribution must be described")
    .max(2000),
  skillTags: z.array(z.string().trim()).min(1, "At least one skill tag is required"),
});
export type AddProjectEvidenceRequest = z.infer<typeof AddProjectEvidenceRequestSchema>;

export const ProjectEvidenceDtoSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  evidenceType: EvidenceTypeSchema,
  title: z.string(),
  description: z.string(),
  url: z.string().nullable(),
  filePath: z.string().nullable(),
  personalContribution: z.string(),
  isSelfReported: z.boolean(),
  skillTags: z.array(z.string()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ProjectEvidenceDto = z.infer<typeof ProjectEvidenceDtoSchema>;

export const ProjectDtoSchema = z.object({
  id: z.string().uuid(),
  candidateId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  roleInProject: ProjectRoleSchema,
  teamSize: z.number().nullable(),
  personalContribution: z.string(),
  githubUrl: z.string().nullable(),
  projectUrl: z.string().nullable(),
  demoUrl: z.string().nullable(),
  isTeamProject: z.boolean(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  sortOrder: z.number(),
  evidence: z.array(ProjectEvidenceDtoSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ProjectDto = z.infer<typeof ProjectDtoSchema>;

export const CandidateProfileDtoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  bio: z.string().nullable(),
  locationCity: z.string().nullable(),
  locationCountry: z.string().nullable(),
  status: CandidateStatusSchema.nullable(),
  visibility: CandidateVisibilitySchema,
  yearsExperience: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CandidateProfileDto = z.infer<typeof CandidateProfileDtoSchema>;

// Full Portfolio DTO
export const CandidatePortfolioDtoSchema = z.object({
  profile: CandidateProfileDtoSchema,
  fullName: z.string(),
  email: z.string(),
  skills: z.array(CandidateSkillDtoSchema),
  education: z.array(CandidateEducationDtoSchema),
  experience: z.array(CandidateExperienceDtoSchema),
  projects: z.array(ProjectDtoSchema),
});
export type CandidatePortfolioDto = z.infer<typeof CandidatePortfolioDtoSchema>;

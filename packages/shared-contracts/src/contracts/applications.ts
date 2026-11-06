import { z } from "zod";
import { JobDtoSchema } from "./jobs.js";
import { ProjectEvidenceDtoSchema } from "./portfolio.js";

export const ApplicationStatusSchema = z.enum([
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

export const AntiGhostingSlaStatusSchema = z.enum([
  "ON_TRACK",
  "AT_RISK",
  "BREACHED",
]);
export type AntiGhostingSlaStatus = z.infer<typeof AntiGhostingSlaStatusSchema>;

// Strict State Machine Valid Transitions (Server enforced)
export const ALLOWED_STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ["SCREENING", "REJECTED"],
  SCREENING: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFER", "REJECTED"],
  OFFER: ["HIRED", "REJECTED"],
  HIRED: [],
  REJECTED: ["SCREENING"], // Reopening requires explicit reason
};

export function isValidStatusTransition(
  from: ApplicationStatus,
  to: ApplicationStatus
): boolean {
  const allowed = ALLOWED_STATUS_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

// Application Submission
export const EvidenceMappingInputSchema = z.object({
  jobRequirementId: z.string().uuid(),
  projectEvidenceId: z.string().uuid(),
});
export type EvidenceMappingInput = z.infer<typeof EvidenceMappingInputSchema>;

export const ApplyToJobRequestSchema = z.object({
  coverNote: z
    .string()
    .trim()
    .max(1000, "Cover note cannot exceed 1000 characters")
    .optional()
    .nullable(),
  evidenceMappings: z.array(EvidenceMappingInputSchema).default([]),
});
export type ApplyToJobRequest = z.infer<typeof ApplyToJobRequestSchema>;

// Status Transition Request
export const UpdateApplicationStatusRequestSchema = z.object({
  status: ApplicationStatusSchema,
  reason: z.string().trim().max(500).optional().nullable(),
});
export type UpdateApplicationStatusRequest = z.infer<
  typeof UpdateApplicationStatusRequestSchema
>;

// Evaluation Notes
export const CreateEvaluationNoteRequestSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Note content cannot be empty")
    .max(2000, "Note content cannot exceed 2000 characters"),
  isInternal: z.boolean().default(true),
});
export type CreateEvaluationNoteRequest = z.infer<
  typeof CreateEvaluationNoteRequestSchema
>;

export const EvaluationNoteDtoSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  authorId: z.string().uuid(),
  authorName: z.string(),
  content: z.string(),
  isInternal: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type EvaluationNoteDto = z.infer<typeof EvaluationNoteDtoSchema>;

// Status History
export const ApplicationStatusHistoryDtoSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  fromStatus: ApplicationStatusSchema.nullable(),
  toStatus: ApplicationStatusSchema,
  changedBy: z.string().uuid(),
  changedByName: z.string().optional(),
  reason: z.string().nullable(),
  createdAt: z.string(),
});
export type ApplicationStatusHistoryDto = z.infer<
  typeof ApplicationStatusHistoryDtoSchema
>;

// Evidence Mapping DTO
export const EvidenceMappingDtoSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  jobRequirementId: z.string().uuid(),
  projectEvidenceId: z.string().uuid().nullable(),
  requirementText: z.string().optional(),
  importance: z.enum(["REQUIRED", "PREFERRED"]).optional(),
  evidenceTypeHint: z.string().nullable().optional(),
  relevanceScore: z.string().nullable(),
  relevanceReason: z.string().nullable(),
  isAiAssisted: z.boolean(),
  computedAt: z.string(),
  evidence: ProjectEvidenceDtoSchema.nullable().optional(),
});
export type EvidenceMappingDto = z.infer<typeof EvidenceMappingDtoSchema>;

// Candidate Application Summary (Candidate-facing, ZERO evaluation notes!)
export const CandidateApplicationSummaryDtoSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  jobTitle: z.string(),
  organisationName: z.string(),
  status: ApplicationStatusSchema,
  coverNote: z.string().nullable(),
  slaDeadline: z.string().nullable(),
  slaStatus: AntiGhostingSlaStatusSchema,
  daysInCurrentStage: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  history: z.array(ApplicationStatusHistoryDtoSchema),
});
export type CandidateApplicationSummaryDto = z.infer<
  typeof CandidateApplicationSummaryDtoSchema
>;

// Detailed Application DTO (for employer review)
export const ApplicationDetailDtoSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),
  candidateName: z.string(),
  candidateEmail: z.string(),
  candidateProfileId: z.string().uuid(),
  status: ApplicationStatusSchema,
  coverNote: z.string().nullable(),
  slaDeadline: z.string().nullable(),
  slaStatus: AntiGhostingSlaStatusSchema,
  daysInCurrentStage: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  job: JobDtoSchema,
  evidenceMappings: z.array(EvidenceMappingDtoSchema),
  history: z.array(ApplicationStatusHistoryDtoSchema),
  evaluationNotes: z.array(EvaluationNoteDtoSchema), // Only returned to authorized employer
});
export type ApplicationDetailDto = z.infer<typeof ApplicationDetailDtoSchema>;

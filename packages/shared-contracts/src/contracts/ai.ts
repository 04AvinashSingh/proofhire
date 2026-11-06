import { z } from "zod";

export const SupportLevelEnum = z.enum([
  "SUPPORTED",
  "PARTIALLY_SUPPORTED",
  "INSUFFICIENT",
  "CONTRADICTED",
]);
export type SupportLevel = z.infer<typeof SupportLevelEnum>;

export const AiAssessmentSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  requirementId: z.string().uuid(),
  supportLevel: SupportLevelEnum,
  confidence: z.number().min(0).max(1),
  citations: z.array(z.string()),
  limitations: z.array(z.string()),
  advisoryNotes: z.string(),
  isSelfReported: z.boolean().default(true), // Rule #8
  securityWarnings: z.array(z.string()).default([]),
  rule7Disclaimer: z.string().default(
    "Advisory Only: AI provides grounded citations to assist evaluation. Final hiring decisions are made exclusively by human reviewers."
  ),
  createdAt: z.string(),
});
export type AiAssessmentDto = z.infer<typeof AiAssessmentSchema>;

export const AssessApplicationRequestSchema = z.object({
  applicationId: z.string().uuid(),
  requirementId: z.string().uuid().optional(),
});
export type AssessApplicationRequestDto = z.infer<typeof AssessApplicationRequestSchema>;

export const AssessApplicationResponseSchema = z.object({
  assessments: z.array(AiAssessmentSchema),
  status: z.enum(["SUCCESS", "DEGRADED", "UNAVAILABLE"]),
  message: z.string(),
});
export type AssessApplicationResponseDto = z.infer<typeof AssessApplicationResponseSchema>;

export const VerifyEvidenceRequestSchema = z.object({
  evidenceId: z.string().uuid(),
  evidenceType: z.enum(["GITHUB_REPO", "COMMIT_HASH", "LIVE_DEPLOYMENT", "DESIGN_DOC"]),
  repoUrl: z.string().url().optional(),
  commitHash: z.string().optional(),
  artifactUrl: z.string().optional(),
});
export type VerifyEvidenceRequestDto = z.infer<typeof VerifyEvidenceRequestSchema>;

export const VerifyEvidenceResponseSchema = z.object({
  evidenceId: z.string().uuid(),
  verified: z.boolean(),
  verificationMethod: z.string(),
  details: z.string(),
  timestamp: z.string(),
});
export type VerifyEvidenceResponseDto = z.infer<typeof VerifyEvidenceResponseSchema>;

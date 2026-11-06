import { env } from "../config/env.js";
import { logger } from "../logger.js";
import type {
  SupportLevel,
  VerifyEvidenceRequestDto,
  VerifyEvidenceResponseDto,
} from "@proofhire/shared-contracts";

export interface EvidenceChunkInput {
  id: string;
  title: string;
  text: string;
  sourceUrl?: string;
  isSelfReported?: boolean;
}

export interface AiExplanationResult {
  requirementText: string;
  supportLevel: SupportLevel;
  confidence: number;
  citations: string[];
  limitations: string[];
  advisoryNotes: string;
  isSelfReported: boolean;
  securityWarnings: string[];
  rule7Disclaimer: string;
  isFallback?: boolean;
}

export class AiServiceClient {
  private baseUrl: string;
  private isEnabled: boolean;

  constructor() {
    this.baseUrl = env.AI_SERVICE_URL;
    this.isEnabled = env.FEATURE_AI_ENABLED;
  }

  async isHealthy(): Promise<boolean> {
    if (!this.isEnabled) return false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  async generateExplanation(
    requirementText: string,
    chunks: EvidenceChunkInput[]
  ): Promise<AiExplanationResult> {
    if (!this.isEnabled) {
      return this.buildFallbackExplanation(
        requirementText,
        chunks,
        "AI service is disabled by feature flag FEATURE_AI_ENABLED."
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${this.baseUrl}/api/v1/relevance-explanation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirement_text: requirementText,
          evidence_chunks: chunks.map((c) => ({
            id: c.id,
            title: c.title,
            text: c.text,
            source_url: c.sourceUrl,
            is_self_reported: c.isSelfReported ?? true,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`AI service returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as any;
      return {
        requirementText: data.requirement_text,
        supportLevel: data.support_level,
        confidence: data.confidence,
        citations: data.citations || [],
        limitations: data.limitations || [],
        advisoryNotes: data.advisory_notes,
        isSelfReported: data.is_self_reported ?? true,
        securityWarnings: data.security_warnings || [],
        rule7Disclaimer: data.rule_7_disclaimer,
        isFallback: false,
      };
    } catch (err) {
      logger.warn({ err }, "AI service unavailable, falling back to deterministic explanation");
      return this.buildFallbackExplanation(
        requirementText,
        chunks,
        "AI service temporarily unreachable. Evaluation generated via deterministic fallback."
      );
    }
  }

  async verifyEvidence(dto: VerifyEvidenceRequestDto): Promise<VerifyEvidenceResponseDto> {
    if (!this.isEnabled) {
      return {
        evidenceId: dto.evidenceId,
        verified: false,
        verificationMethod: "FALLBACK_OFFLINE",
        details: "AI service verification disabled by feature flag.",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${this.baseUrl}/api/v1/verify-evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evidence_id: dto.evidenceId,
          evidence_type: dto.evidenceType,
          repo_url: dto.repoUrl,
          commit_hash: dto.commitHash,
          artifact_url: dto.artifactUrl,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`AI service returned HTTP ${res.status}`);
      }

      const data = (await res.json()) as any;
      return {
        evidenceId: data.evidence_id,
        verified: data.verified,
        verificationMethod: data.verification_method,
        details: data.details,
        timestamp: data.timestamp,
      };
    } catch (err) {
      logger.warn({ err }, "AI verification service unreachable");
      return {
        evidenceId: dto.evidenceId,
        verified: false,
        verificationMethod: "FALLBACK_OFFLINE",
        details: "Verification service temporarily unavailable.",
        timestamp: new Date().toISOString(),
      };
    }
  }

  private buildFallbackExplanation(
    requirementText: string,
    chunks: EvidenceChunkInput[],
    note: string
  ): AiExplanationResult {
    // Deterministic keyword-based fallback
    const reqWords = requirementText.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const matchedCitations: string[] = [];

    for (const chunk of chunks) {
      const chunkLower = chunk.text.toLowerCase();
      for (const word of reqWords) {
        if (chunkLower.includes(word) && !matchedCitations.includes(chunk.text.slice(0, 200))) {
          matchedCitations.push(chunk.text.slice(0, 200));
        }
      }
    }

    const hasMatches = matchedCitations.length > 0;
    return {
      requirementText,
      supportLevel: hasMatches ? "SUPPORTED" : "INSUFFICIENT",
      confidence: hasMatches ? 0.65 : 0.85,
      citations: matchedCitations.slice(0, 3),
      limitations: hasMatches
        ? ["Generated via offline fallback without deep semantic synthesis."]
        : ["No direct evidence matching requirement keywords was found."],
      advisoryNotes: `${hasMatches ? "Relevant evidence keywords found." : "Insufficient evidence keywords found."} (${note})`,
      isSelfReported: true,
      securityWarnings: [],
      rule7Disclaimer:
        "Advisory Only: AI provides grounded citations to assist evaluation. Final hiring decisions are made exclusively by human reviewers.",
      isFallback: true,
    };
  }
}

export const aiServiceClient = new AiServiceClient();

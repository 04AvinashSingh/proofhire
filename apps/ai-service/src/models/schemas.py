from enum import Enum

from pydantic import BaseModel, Field


class SupportLevel(str, Enum):
    SUPPORTED = "SUPPORTED"
    PARTIALLY_SUPPORTED = "PARTIALLY_SUPPORTED"
    INSUFFICIENT = "INSUFFICIENT"
    CONTRADICTED = "CONTRADICTED"


# ================================================================
# Embeddings
# ================================================================
class EmbeddingRequest(BaseModel):
    texts: list[str] = Field(..., min_length=1, description="List of text chunks to embed")


class EmbeddingItem(BaseModel):
    index: int
    embedding: list[float]


class EmbeddingResponse(BaseModel):
    data: list[EmbeddingItem]
    model: str
    dimension: int


# ================================================================
# Semantic Matching
# ================================================================
class EvidenceChunk(BaseModel):
    id: str
    title: str
    text: str
    source_url: str | None = None
    is_self_reported: bool = True  # Rule #8 invariant


class SemanticMatchRequest(BaseModel):
    requirement_text: str = Field(..., min_length=3)
    evidence_chunks: list[EvidenceChunk] = Field(default_factory=list)
    top_k: int = Field(default=5, ge=1, le=20)


class ScoredEvidenceMatch(BaseModel):
    evidence_id: str
    title: str
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    is_self_reported: bool
    source_url: str | None = None


class SemanticMatchResponse(BaseModel):
    requirement_text: str
    matches: list[ScoredEvidenceMatch]
    top_similarity: float


# ================================================================
# Grounded Relevance Explanations (RAG)
# ================================================================
class RelevanceExplanationRequest(BaseModel):
    requirement_text: str = Field(..., min_length=3)
    evidence_chunks: list[EvidenceChunk] = Field(default_factory=list)


class RelevanceExplanationResponse(BaseModel):
    requirement_text: str
    support_level: SupportLevel
    confidence: float = Field(..., ge=0.0, le=1.0)
    citations: list[str] = Field(default_factory=list, description="Direct verbatim excerpts from candidate evidence")
    limitations: list[str] = Field(default_factory=list, description="Missing aspects or candidate experience limits")
    advisory_notes: str = Field(..., description="Neutral factual explanation for human reviewers")
    is_self_reported: bool = True
    security_warnings: list[str] = Field(default_factory=list)
    rule_7_disclaimer: str = (
        "Advisory Only: AI provides grounded citations to assist evaluation. "
        "Final hiring decisions are made exclusively by human reviewers."
    )


# ================================================================
# Independent Verification Pipeline
# ================================================================
class VerificationRequest(BaseModel):
    evidence_id: str
    evidence_type: str = Field(..., description="GITHUB_REPO | COMMIT_HASH | LIVE_DEPLOYMENT | DESIGN_DOC")
    repo_url: str | None = None
    commit_hash: str | None = None
    artifact_url: str | None = None


class VerificationResponse(BaseModel):
    evidence_id: str
    verified: bool
    verification_method: str
    details: str
    timestamp: str

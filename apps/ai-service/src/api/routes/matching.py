from fastapi import APIRouter

from src.models.schemas import SemanticMatchRequest, SemanticMatchResponse
from src.services.matching_service import matching_service

router = APIRouter(prefix="/api/v1", tags=["Matching"])


@router.post("/semantic-match", response_model=SemanticMatchResponse)
async def semantic_match(req: SemanticMatchRequest):
    return await matching_service.match_evidence(
        requirement_text=req.requirement_text,
        evidence_chunks=req.evidence_chunks,
        top_k=req.top_k,
    )

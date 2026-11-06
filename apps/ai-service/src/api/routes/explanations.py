from fastapi import APIRouter

from src.models.schemas import RelevanceExplanationRequest, RelevanceExplanationResponse
from src.services.rag_service import rag_service

router = APIRouter(prefix="/api/v1", tags=["Explanations"])


@router.post("/relevance-explanation", response_model=RelevanceExplanationResponse)
async def generate_explanation(req: RelevanceExplanationRequest):
    return await rag_service.generate_explanation(
        requirement_text=req.requirement_text,
        evidence_chunks=req.evidence_chunks,
    )

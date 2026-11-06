from fastapi import APIRouter

from src.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "proofhire-ai-service",
        "provider": settings.LLM_PROVIDER,
        "embedding_dimension": settings.EMBEDDING_DIMENSION,
    }


@router.get("/ready")
async def readiness_check():
    return {"status": "ready"}

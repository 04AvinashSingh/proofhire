from fastapi import APIRouter

from src.core.config import settings
from src.models.schemas import EmbeddingItem, EmbeddingRequest, EmbeddingResponse
from src.services.embedding_service import embedding_service

router = APIRouter(prefix="/api/v1", tags=["Embeddings"])


@router.post("/embeddings", response_model=EmbeddingResponse)
async def create_embeddings(req: EmbeddingRequest):
    vectors = await embedding_service.get_embeddings(req.texts)
    items = [
        EmbeddingItem(index=i, embedding=vec)
        for i, vec in enumerate(vectors)
    ]
    return EmbeddingResponse(
        data=items,
        model=f"proofhire-dense-{settings.LLM_PROVIDER}",
        dimension=settings.EMBEDDING_DIMENSION,
    )

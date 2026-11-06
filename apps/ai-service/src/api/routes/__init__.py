from .embeddings import router as embeddings_router
from .explanations import router as explanations_router
from .health import router as health_router
from .matching import router as matching_router
from .metrics import router as metrics_router
from .verification import router as verification_router

__all__ = [
    "embeddings_router",
    "explanations_router",
    "health_router",
    "matching_router",
    "metrics_router",
    "verification_router",
]

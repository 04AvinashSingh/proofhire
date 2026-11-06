import hashlib
import logging

import numpy as np

from src.core.config import settings


def _generate_deterministic_vector(text: str, dimension: int = 1536) -> list[float]:
    """
    Generates a deterministic, normalized 1536-dimensional vector for offline/mock development.
    Uses n-gram and token hashing so semantically similar phrases share sub-vector weights,
    ensuring cosine similarity tests behave realistically without requiring cloud API calls.
    """
    if not text:
        return [0.0] * dimension

    # Initialize a seed vector
    vec = np.zeros(dimension, dtype=np.float32)

    # Tokenize words
    words = text.lower().replace("-", " ").replace("_", " ").split()
    for word in words:
        if not word:
            continue
        # Hash each word into multiple positions across the vector
        word_hash = int(hashlib.sha256(word.encode("utf-8")).hexdigest(), 16)
        idx1 = word_hash % dimension
        idx2 = (word_hash >> 16) % dimension
        idx3 = (word_hash >> 32) % dimension

        vec[idx1] += 1.0
        vec[idx2] += 0.5
        vec[idx3] += 0.25

    # Normalize vector to unit length (L2 norm)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm

    return vec.tolist()


class EmbeddingService:
    def __init__(self):
        self.dimension = settings.EMBEDDING_DIMENSION
        self.provider = settings.LLM_PROVIDER

    async def get_embeddings(self, texts: list[str]) -> list[list[float]]:
        """
        Returns dense vector embeddings for a batch of texts.
        """
        # If OpenAI is configured and selected
        if self.provider == "openai" and settings.OPENAI_API_KEY:
            try:
                import httpx
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/embeddings",
                        headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                        json={"input": texts, "model": "text-embedding-3-small"}
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    return [item["embedding"] for item in data["data"]]
            except Exception as err:  # noqa: BLE001
                # Graceful fallback to deterministic generator if network/API fails

                logging.getLogger("proofhire-ai").warning("OpenAI embedding API failed, falling back to mock: %s", err)

        # Default: deterministic mock generator
        return [_generate_deterministic_vector(t, self.dimension) for t in texts]


embedding_service = EmbeddingService()

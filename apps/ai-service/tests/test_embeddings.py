import numpy as np
import pytest


@pytest.mark.asyncio
async def test_create_embeddings_batch(client):
    payload = {
        "texts": [
            "Building REST APIs with TypeScript and Express",
            "PostgreSQL database migration using Drizzle ORM",
            "Writing Dockerfiles and container deployment",
        ]
    }
    response = await client.post("/api/v1/embeddings", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["dimension"] == 1536
    assert len(data["data"]) == 3

    # Check vector normalization
    for item in data["data"]:
        vec = np.array(item["embedding"], dtype=np.float32)
        norm = np.linalg.norm(vec)
        assert abs(norm - 1.0) < 1e-4  # L2 unit normalized


@pytest.mark.asyncio
async def test_deterministic_embedding_consistency(client):
    payload = {"texts": ["Python FastAPI microservice"]}
    res1 = await client.post("/api/v1/embeddings", json=payload)
    res2 = await client.post("/api/v1/embeddings", json=payload)

    assert res1.json()["data"][0]["embedding"] == res2.json()["data"][0]["embedding"]

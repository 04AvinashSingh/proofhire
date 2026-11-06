import pytest


@pytest.mark.asyncio
async def test_semantic_match_ranking(client):
    payload = {
        "requirement_text": "Experience with PostgreSQL database indexing and query optimization",
        "evidence_chunks": [
            {
                "id": "chunk-1",
                "title": "PostgreSQL Performance Optimization",
                "text": "Created B-tree and GIN indexes in PostgreSQL database, reducing p95 query latency from 450ms to 28ms using EXPLAIN ANALYZE.",
                "source_url": "https://github.com/candidate/db-optimizer",
                "is_self_reported": True,
            },
            {
                "id": "chunk-2",
                "title": "Frontend React Component Library",
                "text": "Built reusable React Tailwind design system with accessible modal dialogs and dark mode switcher.",
                "source_url": "https://github.com/candidate/ui-library",
                "is_self_reported": True,
            },
            {
                "id": "chunk-3",
                "title": "SQL Schema Migrations",
                "text": "Wrote relational database migrations in PostgreSQL with unique foreign key constraints.",
                "source_url": "https://github.com/candidate/backend-api",
                "is_self_reported": True,
            },
        ],
        "top_k": 3,
    }

    response = await client.post("/api/v1/semantic-match", json=payload)
    assert response.status_code == 200
    data = response.json()

    matches = data["matches"]
    assert len(matches) == 3

    # The PostgreSQL performance chunk should rank higher than the React component chunk
    assert matches[0]["evidence_id"] == "chunk-1"
    assert matches[0]["similarity_score"] > matches[-1]["similarity_score"]


@pytest.mark.asyncio
async def test_semantic_match_empty_evidence(client):
    payload = {
        "requirement_text": "Experience with Kubernetes clusters",
        "evidence_chunks": [],
    }
    response = await client.post("/api/v1/semantic-match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["matches"] == []
    assert data["top_similarity"] == 0.0

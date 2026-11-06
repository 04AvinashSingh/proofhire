import pytest
from src.models.schemas import SupportLevel


@pytest.mark.asyncio
async def test_relevance_explanation_supported(client):
    payload = {
        "requirement_text": "Production experience with Docker containers and Docker Compose",
        "evidence_chunks": [
            {
                "id": "ev-docker",
                "title": "Containerized Microservices",
                "text": "Authored production multi-stage Dockerfile and Docker Compose orchestration for 4 microservices with health checks.",
                "source_url": "https://github.com/candidate/infra",
                "is_self_reported": True,
            }
        ],
    }

    response = await client.post("/api/v1/relevance-explanation", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["support_level"] == SupportLevel.SUPPORTED.value
    assert len(data["citations"]) > 0
    assert "Dockerfile and Docker Compose" in data["citations"][0]
    assert data["is_self_reported"] is True  # Rule #8
    assert "Advisory Only" in data["rule_7_disclaimer"]  # Rule #7
    assert data["confidence"] >= 0.70


@pytest.mark.asyncio
async def test_relevance_explanation_insufficient_evidence(client):
    payload = {
        "requirement_text": "Experience with Rust memory management and async Tokio",
        "evidence_chunks": [
            {
                "id": "ev-html",
                "title": "HTML Portfolio",
                "text": "Built a static website using semantic HTML5 and CSS flexbox layouts.",
                "source_url": "https://github.com/candidate/static",
                "is_self_reported": True,
            }
        ],
    }

    response = await client.post("/api/v1/relevance-explanation", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["support_level"] == SupportLevel.INSUFFICIENT.value
    assert len(data["citations"]) == 0
    assert len(data["limitations"]) > 0
    assert "does not contain keywords" in data["limitations"][0].lower()


@pytest.mark.asyncio
async def test_relevance_explanation_empty_evidence(client):
    payload = {
        "requirement_text": "GraphQL API development with Apollo Server",
        "evidence_chunks": [],
    }

    response = await client.post("/api/v1/relevance-explanation", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["support_level"] == SupportLevel.INSUFFICIENT.value
    assert len(data["citations"]) == 0
    assert "No candidate portfolio evidence" in data["limitations"][0]


@pytest.mark.asyncio
async def test_relevance_explanation_contradicted(client):
    payload = {
        "requirement_text": "AWS Cloud deployment and Terraform",
        "evidence_chunks": [
            {
                "id": "ev-disclaimer",
                "title": "Skills Overview",
                "text": "I have no experience with AWS or cloud deployment; all my work is local.",
                "source_url": "https://github.com/candidate/profile",
                "is_self_reported": True,
            }
        ],
    }

    response = await client.post("/api/v1/relevance-explanation", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["support_level"] == SupportLevel.CONTRADICTED.value
    assert "contradicts" in data["advisory_notes"].lower()

import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "proofhire-ai-service"
    assert "provider" in data


@pytest.mark.asyncio
async def test_readiness_check(client):
    response = await client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}


@pytest.mark.asyncio
async def test_prometheus_metrics(client):
    response = await client.get("/metrics")
    assert response.status_code == 200
    assert "text/plain" in response.headers.get("content-type", "")
    content = response.text
    assert "proofhire_ai_uptime_seconds" in content
    assert "proofhire_ai_provider_info" in content
    assert "proofhire_ai_healthy_status 1" in content

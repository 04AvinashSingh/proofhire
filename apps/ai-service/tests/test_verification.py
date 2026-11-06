import pytest


@pytest.mark.asyncio
async def test_verify_valid_github_repo(client):
    payload = {
        "evidence_id": "ev-gh-1",
        "evidence_type": "GITHUB_REPO",
        "repo_url": "https://github.com/facebook/react",
    }
    response = await client.post("/api/v1/verify-evidence", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verified"] is True
    assert "owner='facebook'" in data["details"]
    assert "repo='react'" in data["details"]


@pytest.mark.asyncio
async def test_verify_invalid_github_repo(client):
    payload = {
        "evidence_id": "ev-gh-2",
        "evidence_type": "GITHUB_REPO",
        "repo_url": "https://notgithub.com/fake/repo",
    }
    response = await client.post("/api/v1/verify-evidence", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verified"] is False
    assert "not a valid public github repository" in data["details"].lower()


@pytest.mark.asyncio
async def test_verify_valid_commit_hash(client):
    payload = {
        "evidence_id": "ev-commit-1",
        "evidence_type": "COMMIT_HASH",
        "commit_hash": "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
    }
    response = await client.post("/api/v1/verify-evidence", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verified"] is True
    assert "Valid Git commit hash format confirmed" in data["details"]


@pytest.mark.asyncio
async def test_verify_invalid_commit_hash(client):
    payload = {
        "evidence_id": "ev-commit-2",
        "evidence_type": "COMMIT_HASH",
        "commit_hash": "not-a-valid-hex-hash!!!",
    }
    response = await client.post("/api/v1/verify-evidence", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verified"] is False
    assert "not a valid" in data["details"].lower()

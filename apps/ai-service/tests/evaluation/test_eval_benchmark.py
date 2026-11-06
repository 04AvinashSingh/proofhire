import json
import os

import pytest


def load_benchmark_cases():
    dataset_path = os.path.join(os.path.dirname(__file__), "eval_dataset.json")
    with open(dataset_path, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.mark.asyncio
async def test_evaluation_benchmark_cases(client):
    cases = load_benchmark_cases()
    assert len(cases) > 0

    for case in cases:
        payload = {
            "requirement_text": case["requirement_text"],
            "evidence_chunks": [
                {
                    "id": case["id"],
                    "title": f"Evidence for {case['id']}",
                    "text": case["evidence_text"],
                    "source_url": "https://github.com/candidate/eval-repo",
                    "is_self_reported": True,
                }
            ],
        }

        response = await client.post("/api/v1/relevance-explanation", json=payload)
        assert response.status_code == 200, f"Failed on case {case['id']}"
        data = response.json()

        # 1. Assert expected support level
        assert data["support_level"] == case["expected_result"], (
            f"Case {case['id']} expected {case['expected_result']}, got {data['support_level']}"
        )

        # 2. Strict Hallucination check: Citations MUST be substrings of the candidate's actual text
        for citation in data["citations"]:
            assert citation in case["evidence_text"], (
                f"Hallucination detected in case {case['id']}! Citation '{citation}' not in evidence text."
            )

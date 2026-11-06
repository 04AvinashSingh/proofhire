
import numpy as np

from src.models.schemas import EvidenceChunk, ScoredEvidenceMatch, SemanticMatchResponse

from .embedding_service import embedding_service


class MatchingService:
    async def match_evidence(
        self,
        requirement_text: str,
        evidence_chunks: list[EvidenceChunk],
        top_k: int = 5
    ) -> SemanticMatchResponse:
        """
        Ranks candidate evidence chunks against a job requirement using vector cosine similarity.
        """
        if not evidence_chunks:
            return SemanticMatchResponse(
                requirement_text=requirement_text,
                matches=[],
                top_similarity=0.0
            )

        # 1. Embed requirement and all evidence chunks
        all_texts = [requirement_text] + [f"{c.title}: {c.text}" for c in evidence_chunks]
        embeddings = await embedding_service.get_embeddings(all_texts)

        req_vec = np.array(embeddings[0], dtype=np.float32)
        req_norm = np.linalg.norm(req_vec)

        scored_matches: list[ScoredEvidenceMatch] = []

        for i, chunk in enumerate(evidence_chunks):
            chunk_vec = np.array(embeddings[i + 1], dtype=np.float32)
            chunk_norm = np.linalg.norm(chunk_vec)

            if req_norm > 0 and chunk_norm > 0:
                # Cosine similarity
                raw_similarity = float(np.dot(req_vec, chunk_vec) / (req_norm * chunk_norm))
                # Clamp between 0.0 and 1.0
                similarity = max(0.0, min(1.0, (raw_similarity + 1.0) / 2.0 if raw_similarity < 0 else raw_similarity))
            else:
                similarity = 0.0

            scored_matches.append(
                ScoredEvidenceMatch(
                    evidence_id=chunk.id,
                    title=chunk.title,
                    similarity_score=round(similarity, 4),
                    is_self_reported=chunk.is_self_reported,
                    source_url=chunk.source_url
                )
            )

        # Sort descending by similarity score
        scored_matches.sort(key=lambda x: x.similarity_score, reverse=True)
        top_matches = scored_matches[:top_k]
        top_similarity = top_matches[0].similarity_score if top_matches else 0.0

        return SemanticMatchResponse(
            requirement_text=requirement_text,
            matches=top_matches,
            top_similarity=top_similarity
        )


matching_service = MatchingService()

import re

from src.core.security import check_prompt_injection, sanitize_for_prompt
from src.models.schemas import (
    EvidenceChunk,
    RelevanceExplanationResponse,
    SupportLevel,
)


class RagExplanationService:
    def _extract_citations_and_gaps(
        self, requirement: str, chunks: list[EvidenceChunk]
    ) -> tuple[list[str], list[str], SupportLevel, float, str]:
        """
        Extracts grounded verbatim citations and limitations from candidate evidence.
        """
        if not chunks:
            return (
                [],
                ["No candidate portfolio evidence addresses this requirement."],
                SupportLevel.INSUFFICIENT,
                0.95,
                "No candidate evidence found for this requirement.",
            )

        req_lower = requirement.lower()
        req_words = set(re.findall(r"\b[a-zA-Z0-9_+#.-]{2,}\b", req_lower))
        stop_words = {
            "and", "the", "for", "with", "experience", "knowledge", "ability",
            "understanding", "years", "skills", "building", "working", "using",
            "required", "preferred", "must", "have", "system", "systems",
            "application", "applications", "development", "stack", "full",
            "level", "practical", "proven", "demonstrated"
        }
        key_req_terms = {w for w in req_words if w not in stop_words}

        citations: list[str] = []
        covered_terms = set()
        has_contradiction = False

        for chunk in chunks:
            text = chunk.text
            # Split into sentences
            sentences = re.split(r"(?<=[.!?\n])\s+", text)
            for sentence in sentences:
                s_clean = sentence.strip()
                if not s_clean or len(s_clean) < 10:
                    continue
                s_lower = s_clean.lower()

                contradiction_phrases = ["no experience", "haven't used", "never worked with", "not familiar"]
                if any(phrase in s_lower for phrase in contradiction_phrases):
                    for term in key_req_terms:

                        if term in s_lower:
                            has_contradiction = True
                            citations.append(s_clean[:200])

                # Match key technical terms with prefix and stem support
                matched_in_sentence = [
                    term for term in key_req_terms
                    if re.search(r"\b" + re.escape(term), s_lower)
                    or (len(term) > 3 and re.search(r"\b" + re.escape(term.rstrip("s")), s_lower))
                ]
                if matched_in_sentence:
                    covered_terms.update(matched_in_sentence)
                    if len(citations) < 5 and s_clean[:250] not in citations:
                        citations.append(s_clean[:250])

        missing_terms = key_req_terms - covered_terms

        if has_contradiction:
            return (
                citations[:3],
                [f"Candidate explicitly noted lack of experience with: {', '.join(missing_terms or key_req_terms)}"],
                SupportLevel.CONTRADICTED,
                0.90,
                "Candidate evidence contradicts or explicitly disclaims this requirement.",
            )

        if not covered_terms:
            return (
                [],
                ["Candidate evidence does not contain keywords or practical artifacts relating to this requirement."],
                SupportLevel.INSUFFICIENT,
                0.85,
                "Insufficient evidence provided to demonstrate competence for this requirement.",
            )

        coverage_ratio = len(covered_terms) / max(len(key_req_terms), 1)

        limitations = []
        if missing_terms:
            limitations.append(f"Evidence does not directly demonstrate: {', '.join(sorted(missing_terms))}")

        if coverage_ratio >= 0.5:
            support_level = SupportLevel.SUPPORTED
            advisory = (
                f"Candidate evidence directly supports this requirement with verifiable references "
                f"to {', '.join(sorted(covered_terms))}."
            )
            confidence = min(0.95, round(0.70 + (coverage_ratio * 0.25), 2))
        else:
            support_level = SupportLevel.PARTIALLY_SUPPORTED
            advisory = (
                f"Candidate demonstrates partial competence covering {', '.join(sorted(covered_terms))}, "
                f"but lacks visible evidence for {', '.join(sorted(missing_terms))}."
            )
            confidence = round(0.65 + (coverage_ratio * 0.20), 2)

        return citations[:4], limitations, support_level, confidence, advisory

    async def generate_explanation(
        self,
        requirement_text: str,
        evidence_chunks: list[EvidenceChunk]
    ) -> RelevanceExplanationResponse:
        """
        Generates a grounded RAG relevance explanation with prompt injection defense.
        """
        security_warnings: list[str] = []
        sanitized_chunks: list[EvidenceChunk] = []

        # 1. Inspect untrusted evidence for prompt injection attacks
        for chunk in evidence_chunks:
            is_suspicious, reason = check_prompt_injection(chunk.text)
            if is_suspicious:
                security_warnings.append(
                    f"Warning for evidence '{chunk.title}': {reason}. Malicious instruction bypassed."
                )

            # Sanitize to neutralize escape tags
            clean_text = sanitize_for_prompt(chunk.text)
            sanitized_chunks.append(
                EvidenceChunk(
                    id=chunk.id,
                    title=chunk.title,
                    text=clean_text,
                    source_url=chunk.source_url,
                    is_self_reported=chunk.is_self_reported,
                )
            )

        # 2. Extract citations, gaps, and grounded assessment
        citations, limitations, support_level, confidence, advisory = self._extract_citations_and_gaps(
            requirement_text, sanitized_chunks
        )

        return RelevanceExplanationResponse(
            requirement_text=requirement_text,
            support_level=support_level,
            confidence=confidence,
            citations=citations,
            limitations=limitations,
            advisory_notes=advisory,
            is_self_reported=True,
            security_warnings=security_warnings,
        )


rag_service = RagExplanationService()

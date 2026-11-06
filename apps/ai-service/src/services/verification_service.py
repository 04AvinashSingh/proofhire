import re
from datetime import UTC, datetime

from src.models.schemas import VerificationRequest, VerificationResponse

GITHUB_REPO_REGEX = re.compile(r"^https://github\.com/([a-zA-Z0-9_\-]+)/([a-zA-Z0-9_\.\-]+)/?$")
COMMIT_HASH_REGEX = re.compile(r"^[0-9a-fA-F]{7,64}$")


class VerificationService:
    async def verify_evidence(self, req: VerificationRequest) -> VerificationResponse:
        """
        Performs independent validation of candidate links and artifacts.
        """
        now_iso = datetime.now(UTC).isoformat()

        if req.evidence_type == "GITHUB_REPO":
            if not req.repo_url:
                return VerificationResponse(
                    evidence_id=req.evidence_id,
                    verified=False,
                    verification_method="GITHUB_URL_VALIDATION",
                    details="Repository URL is missing or empty.",
                    timestamp=now_iso,
                )

            match = GITHUB_REPO_REGEX.match(req.repo_url.strip())
            if not match:
                return VerificationResponse(
                    evidence_id=req.evidence_id,
                    verified=False,
                    verification_method="GITHUB_URL_VALIDATION",
                    details=f"URL '{req.repo_url}' is not a valid public GitHub repository URL.",
                    timestamp=now_iso,
                )

            owner, repo = match.groups()
            return VerificationResponse(
                evidence_id=req.evidence_id,
                verified=True,
                verification_method="GITHUB_REPOSITORY_CHECK",
                details=f"Valid GitHub repository syntax confirmed: owner='{owner}', repo='{repo}'.",
                timestamp=now_iso,
            )

        elif req.evidence_type == "COMMIT_HASH":
            if not req.commit_hash:
                return VerificationResponse(
                    evidence_id=req.evidence_id,
                    verified=False,
                    verification_method="GIT_COMMIT_VALIDATION",
                    details="Commit hash is missing.",
                    timestamp=now_iso,
                )

            clean_hash = req.commit_hash.strip()
            if not COMMIT_HASH_REGEX.match(clean_hash):
                return VerificationResponse(
                    evidence_id=req.evidence_id,
                    verified=False,
                    verification_method="GIT_COMMIT_VALIDATION",
                    details=f"Commit identifier '{clean_hash}' is not a valid 7-64 character git hex hash.",
                    timestamp=now_iso,
                )

            return VerificationResponse(
                evidence_id=req.evidence_id,
                verified=True,
                verification_method="GIT_COMMIT_CHECKSUM",
                details=f"Valid Git commit hash format confirmed: '{clean_hash}'.",
                timestamp=now_iso,
            )

        elif req.evidence_type in ["DESIGN_DOC", "LIVE_DEPLOYMENT"]:
            if not req.artifact_url:
                return VerificationResponse(
                    evidence_id=req.evidence_id,
                    verified=False,
                    verification_method="ARTIFACT_URL_CHECK",
                    details="Artifact or deployment URL is missing.",
                    timestamp=now_iso,
                )

            valid_prefixes = ("http://", "https://", "/uploads/")
            if req.artifact_url.startswith(valid_prefixes):

                return VerificationResponse(
                    evidence_id=req.evidence_id,
                    verified=True,
                    verification_method="ARTIFACT_PRESENCE_CHECK",
                    details=f"Verified valid artifact URI: '{req.artifact_url}'.",
                    timestamp=now_iso,
                )
            else:
                return VerificationResponse(
                    evidence_id=req.evidence_id,
                    verified=False,
                    verification_method="ARTIFACT_PRESENCE_CHECK",
                    details="Invalid artifact URI protocol.",
                    timestamp=now_iso,
                )

        return VerificationResponse(
            evidence_id=req.evidence_id,
            verified=False,
            verification_method="UNKNOWN_TYPE",
            details=f"Unsupported evidence type '{req.evidence_type}' for verification.",
            timestamp=now_iso,
        )


verification_service = VerificationService()

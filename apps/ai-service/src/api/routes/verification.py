from fastapi import APIRouter

from src.models.schemas import VerificationRequest, VerificationResponse
from src.services.verification_service import verification_service

router = APIRouter(prefix="/api/v1", tags=["Verification"])


@router.post("/verify-evidence", response_model=VerificationResponse)
async def verify_evidence(req: VerificationRequest):
    return await verification_service.verify_evidence(req)

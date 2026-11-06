import time

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

from src.core.config import settings

router = APIRouter(tags=["Metrics"])
START_TIME = time.time()


@router.get("/metrics", response_class=PlainTextResponse)
async def prometheus_metrics():
    uptime = int(time.time() - START_TIME)
    info_label = f'provider="{settings.LLM_PROVIDER}",dimension="{settings.EMBEDDING_DIMENSION}"'
    lines = [
        "# HELP proofhire_ai_uptime_seconds Uptime of ProofHire AI service in seconds",
        "# TYPE proofhire_ai_uptime_seconds gauge",
        f"proofhire_ai_uptime_seconds {uptime}",
        "# HELP proofhire_ai_provider_info Information about active LLM and embedding provider",
        "# TYPE proofhire_ai_provider_info gauge",
        f"proofhire_ai_provider_info{{{info_label}}} 1",
        "# HELP proofhire_ai_healthy_status Health indicator of the service",
        "# TYPE proofhire_ai_healthy_status gauge",
        "proofhire_ai_healthy_status 1",
    ]
    return "\n".join(lines) + "\n"

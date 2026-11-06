# ================================================================
# Production Dockerfile for ProofHire AI Service (Python / FastAPI)
# ================================================================
FROM python:3.11-slim AS runner

WORKDIR /app

# Install curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system proofhire && adduser --system --group proofhire

COPY apps/ai-service/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/ai-service/src ./src

# Set ownership to non-root user
RUN chown -R proofhire:proofhire /app

USER proofhire

ENV PYTHONUNBUFFERED=1
ENV AI_SERVICE_HOST=0.0.0.0
ENV AI_SERVICE_PORT=8000
ENV LOG_LEVEL=info

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]


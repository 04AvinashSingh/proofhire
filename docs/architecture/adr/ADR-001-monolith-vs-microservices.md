# ADR-001: Modular Monolith vs Microservices for Core Backend

**Date:** 2026-10-21  
**Status:** Accepted  
**Deciders:** Engineering team

---

## Context

ProofHire is a greenfield product. The team is small and the product hypotheses have not yet been validated. We need to decide how to structure the core backend: as a modular monolith, as a set of microservices from the start, or as something in between.

The technology stack mandate specifies Node.js/TypeScript for the core backend and a separate Python service for AI capabilities.

---

## Options Considered

### Option A: Modular Monolith (single deployable unit)
A single Node.js/TypeScript process organised into well-defined modules (auth, candidates, employers, jobs, applications, evidence, admin). Modules communicate through function calls and shared database transactions. Deployed as a single container.

**Pros:**
- Simple local development: one process, one database, one `.env`.
- Shared database transactions across modules — critical for consistency (e.g., creating a job and its requirements atomically).
- Easy to refactor module boundaries early in the project lifecycle.
- Straightforward debugging and tracing.
- Lower operational overhead: no service discovery, inter-service auth, or network failure modes between modules.
- Appropriate for the expected initial traffic and team size.

**Cons:**
- All modules share the same process — a bug in one module can affect others.
- Single deployment unit — cannot scale individual modules independently.
- Can grow into a "big ball of mud" if module boundaries are not enforced.

### Option B: Microservices from the Start
Separate services for auth, candidate profiles, jobs, applications, evidence, and AI.

**Pros:**
- Independent deployment and scaling per service.
- Technology flexibility per service.

**Cons:**
- Dramatic increase in operational complexity for an unvalidated product.
- Distributed transactions are hard — maintaining consistency across service boundaries without shared DB transactions requires saga patterns or two-phase commit, both of which are significantly more complex than a monolith transaction.
- Requires service discovery, inter-service authentication, and network fault handling from day one.
- Slows down iteration on a product where requirements are still uncertain.
- Over-engineering for the actual traffic expected at MVP scale.

### Option C: Separate Core Backend + Separate Python AI Service (Hybrid)
Core business logic in a modular Node.js/TypeScript monolith. AI-specific capabilities (evidence summarisation, RAG, embeddings) in a separate Python/FastAPI service.

**Pros:**
- Python has the best ecosystem for LLM integration (LangChain, LlamaIndex, LiteLLM).
- AI service is optional and can be scaled independently.
- Core hiring workflow is unaffected when the AI service is unavailable.
- TypeScript/Node.js handles the high-throughput web API; Python handles the computationally intensive AI inference.

**Cons:**
- Two runtimes to manage locally (Docker Compose handles this cleanly).
- Network call between API and AI service introduces latency and a failure mode.
- Requires a defined API contract between the two services.

---

## Decision

**Option C: Modular monolith for the core backend + separate Python AI service.**

The modular monolith handles: auth, candidate profiles, employer organisations, jobs, applications, evidence metadata, and administration.

The Python service handles: AI inference, embeddings, evidence retrieval, and summarisation.

The two services communicate over HTTP. The core backend calls the AI service; the AI service never initiates calls to the core backend.

---

## Consequences

**Easier:**
- Local development (Docker Compose starts both services).
- Database consistency — transactions span the full hiring domain without distributed coordination.
- Refactoring module interfaces early in the project.

**Harder:**
- If a specific module (e.g., job search) needs independent scaling, extraction is required — this is a known future cost.
- Network failure between API and AI service must be handled gracefully (circuit breaker, timeout, fallback to "AI unavailable" response).

**Invariants that enforce the monolith's health:**
- No circular imports between modules.
- Each module owns its own database tables.
- No module bypasses another module's business logic by querying its tables directly (except read-only reporting queries, clearly marked).

---

## Revisit Conditions

- A specific module (e.g., job search, file processing) generates load that degrades unrelated modules.
- The team grows to 5+ engineers and independent deployment cadences become a daily problem.
- The AI service workload warrants a dedicated infrastructure setup separate from the core backend.

# Milestone 5 — AI Service, Semantic Matching, pgvector, and Verification Pipeline Completion Report

**Date:** 2026-10-22  
**Milestone:** 5 — AI Service, Semantic Matching, pgvector, and Verification Pipeline  
**Status:** `COMPLETED`  

---

## 1. Executive Summary

Milestone 5 introduces the intelligent evaluation engine of ProofHire: a **dedicated Python 3.11 FastAPI microservice (`apps/ai-service`)**, **pgvector semantic embeddings with HNSW indexing**, a **Grounded RAG (Retrieval-Augmented Generation) pipeline**, **multi-layered prompt injection defenses**, and an **independent evidence verification pipeline**.

Crucially, this system operates under strict architectural invariants:
- **Zero Automated Rejection (Platform Rule #7):** The AI engine is strictly advisory. Every analysis generated carries explicit disclaimers and advisory labels. The system never makes, recommends, or automates candidate rejection or hiring decisions.
- **Evidence Labeling (Platform Rule #8):** Candidate submissions default to `SELF_REPORTED`. Evidence is only labeled `VERIFIED` if verified through automated checks against external authoritative sources (e.g. GitHub API, Git commit SHA checks, URL availability).
- **Graceful Degradation (Decoupled Microservice):** ProofHire's core applicant tracking, portfolio viewing, and hiring workflows do not depend on the AI service. If the AI microservice is disabled (`FEATURE_AI_ENABLED=false`) or unreachable, the system gracefully falls back to deterministic keyword matching without user interruption.
- **Local Deterministic Development:** Provides an offline deterministic mock provider producing consistent 1536-dimensional L2-normalized vectors and structured analyses, enabling zero-cost local execution and rapid automated testing.

---

## 2. Key Deliverables & System Architecture

### 2.1 Python AI Microservice (`apps/ai-service`)
- **FastAPI & Python 3.11:** High-performance async microservice with strict Pydantic settings and DTO models.
- **Embedding Generation (`/api/v1/embeddings`):** 1536-dimensional L2-normalized vector generator with cosine similarity support. Supports deterministic local mock, OpenAI `text-embedding-3-small`, and local Ollama embeddings.
- **Semantic Matching (`/api/v1/matching/rank`):** Ranks candidate evidence items against job requirements using vector cosine similarity.
- **Grounded RAG Analysis (`/api/v1/rag/explain`):** Grounded candidate evaluation producing verbatim citations (`evidenceQuote`), identified gaps/limitations, contradiction alerts, and a mandatory Rule #7 advisory disclaimer.
- **Evidence Verification (`/api/v1/verify`):** Performs multi-step automated checks for GitHub repositories, Git commit hashes, and artifact endpoints.
- **Prompt Injection Defense (`src/core/security.py`):**
  - Regex pattern detection for instruction overrides (`ignore previous instructions`, `bypass rules`, `system prompt:`, `new instructions:`).
  - XML tag isolation (`<candidate_evidence>`, `<job_requirement>`) to guarantee the LLM cannot be hijacked by candidate input payloads.
  - Tag neutralization and character sanitization preventing XML/HTML delimiter breakouts.
- **Benchmark Evaluation Suite (`tests/evaluation/eval_dataset.json`):** Golden test dataset verifying 0% hallucination on missing skills, accurate citation extraction, and rejection of adversarial prompt injection payloads.

### 2.2 PostgreSQL `pgvector` Schema & Migrations (`@proofhire/api`)
- Custom `vector(1536)` Drizzle column type with bidirectional string/array conversion.
- `evidence_embeddings` table storing candidate project evidence embeddings with foreign key references to `project_evidence`.
- `requirement_embeddings` table storing job requirement embeddings with foreign key references to `job_requirements`.
- `ai_assessments` table persisting evaluation results, support levels (`STRONGLY_SUPPORTED`, `PARTIALLY_SUPPORTED`, `INSUFFICIENT_EVIDENCE`, `CONTRADICTED`), confidence scores, verbatim quotes, and limitations.
- Drizzle Migration `0004_handy_sabra.sql` with `CREATE EXTENSION IF NOT EXISTS vector;` and HNSW cosine index `idx_evidence_embeddings_hnsw`.

### 2.3 API Service & Route Integrations (`@proofhire/api`)
- **AI Service HTTP Client (`aiServiceClient.ts`):** Resilience-wrapped HTTP client with 5-second timeouts, feature flag check, and deterministic keyword-matching fallback when the Python service is offline.
- **AI Assessment Service (`aiAssessmentService.ts`):** Multi-tenant assessment runner verifying employer organization authorization before executing analyses.
- **AI Routes (`routes/ai.ts`):**
  - `POST /api/v1/applications/:id/ai-assessment` (Employer-only trigger)
  - `GET /api/v1/applications/:id/ai-assessment` (Employer-only retrieval)
  - `POST /api/v1/evidence/verify` (Candidate/Employer verification trigger)

### 2.4 Shared Contracts (`@proofhire/shared-contracts`)
- Defined Zod validation schemas and TypeScript types: `AiAssessmentDto`, `SupportLevelEnum`, `AssessApplicationResponseSchema`, and `VerifyEvidenceSchema`.

### 2.5 Employer AI Evaluation Studio UI (`@proofhire/web`)
- **Interactive AI Studio in `EmployerApplicationReviewPage`:**
  - One-click "Analyze All via ProofHire AI" trigger with loading skeletons and error banners.
  - Requirement-by-requirement assessment breakdown displaying support levels, match percentages, and confidence scores.
  - **Grounded Citations:** Displays direct verbatim evidence excerpts confirming candidate technical claims.
  - **Identified Limitations:** Highlights missing evidence or experience gaps to guide human interview questions.
  - **Prominent Rule #7 Notice:** Unmistakable advisory banners reminding human reviewers that ProofHire AI never makes automated decisions.
  - **Rule #8 Verification Status:** Badges distinguishing independently `VERIFIED` artifacts from `SELF_REPORTED` candidate claims.

### 2.6 Architecture Decision Record
- **ADR-008:** *AI Service Architecture, Grounded RAG Pipeline, and Prompt Injection Defenses* (Accepted and indexed in `docs/architecture/adr/README.md`).

---

## 3. Test Execution & Verification

A total of **116 automated tests** pass cleanly across all 21 test suites in the monorepo:

| Workspace | Test Suite | Tests Passed | Status |
|---|---|---|---|
| `apps/ai-service` | `test_security_prompt_injection.py` (Defenses & sanitization) | 4/4 | ✅ Passed |
| `apps/ai-service` | `test_embeddings.py` (1536-dim vector generation) | 2/2 | ✅ Passed |
| `apps/ai-service` | `test_matching.py` (Cosine similarity & ranking) | 2/2 | ✅ Passed |
| `apps/ai-service` | `test_rag_explanations.py` (Citations, limitations, Rule #7) | 4/4 | ✅ Passed |
| `apps/ai-service` | `test_verification.py` (GitHub & commit verification) | 4/4 | ✅ Passed |
| `apps/ai-service` | `test_health.py` (Service health & readiness) | 2/2 | ✅ Passed |
| `apps/ai-service` | `test_eval_benchmark.py` (Golden evaluation dataset) | 1/1 | ✅ Passed |
| `@proofhire/shared-contracts` | `index.test.ts` (All schemas including AI DTOs) | 14/14 | ✅ Passed |
| `@proofhire/api` | `ai.test.ts` (Assessment trigger, retrieval, verification, fallback) | 6/6 | ✅ Passed |
| `@proofhire/api` | `applications.test.ts` (State machine, transitions, SLA calculation) | 8/8 | ✅ Passed |
| `@proofhire/api` | `jobs.test.ts` (Job CRUD, rubrics, status transitions, public discovery) | 6/6 | ✅ Passed |
| `@proofhire/api` | `candidates.test.ts` (Profile, Skills, Projects, Evidence, Visibility) | 8/8 | ✅ Passed |
| `@proofhire/api` | `storageService.test.ts` (Path traversal, MIME validation, 10MB limits) | 5/5 | ✅ Passed |
| `@proofhire/api` | `passwordService.test.ts` (Argon2id hashing) | 4/4 | ✅ Passed |
| `@proofhire/api` | `sessionService.test.ts` (Opaque session hashing) | 4/4 | ✅ Passed |
| `@proofhire/api` | `auth.test.ts` (Registration, login, logout, me) | 10/10 | ✅ Passed |
| `@proofhire/api` | `organisations.test.ts` (Tenant isolation & RBAC) | 7/7 | ✅ Passed |
| `@proofhire/api` | `health.test.ts` (Probes & readiness) | 3/3 | ✅ Passed |
| `@proofhire/api` | `validate.test.ts` (Zod schema validation) | 2/2 | ✅ Passed |
| `@proofhire/api` | `errorHandler.test.ts` (Operational error formatting) | 2/2 | ✅ Passed |
| `@proofhire/web` | `EmployerApplicationReviewPage.test.tsx` (AI Studio, Citations, Rule #7) | 3/3 | ✅ Passed |
| `@proofhire/web` | `CandidateApplicationsPage.test.tsx` (SLA tracking, status history) | 3/3 | ✅ Passed |
| `@proofhire/web` | `JobExplorePage.test.tsx` (Search, filtering, requirement tags) | 3/3 | ✅ Passed |
| `@proofhire/web` | `PublicPortfolioPage.test.tsx` (Portfolio views, Rule #8 badges) | 5/5 | ✅ Passed |
| `@proofhire/web` | `App.test.tsx` (App shell, navigation, authenticated states) | 4/4 | ✅ Passed |
| **Total** | **21 Test Suites** | **116/116** | ✅ **100% Passing** |

---

## 4. Quality Gates & Docker Readiness

1. **Static Analysis & Type Checking:**
   - `npm run typecheck` across all 3 TypeScript workspaces: **0 errors, Exit code 0**
2. **Production Bundle Compilation:**
   - `npm run build` across all packages: **0 errors, Exit code 0**
3. **Docker Multi-Container Orchestration:**
   - `infrastructure/docker/ai-service.Dockerfile` updated and verified.
   - `docker compose config --quiet`: **Syntax valid, 0 warnings/errors, Exit code 0**

---

## 5. Security & Invariant Audit Check

| Invariant / Rule | Implementation Mechanism | Verification Result |
|---|---|---|
| **Rule #7: Zero Automated Rejection** | AI service returns support levels, citations, and limitations; never outputs rejection decisions. Web UI renders prominent warning banners. API rejects automated status transitions. | Verified (Evaluated in `test_rag_explanations.py` & `ai.test.ts`) |
| **Rule #8: Self-Reported Evidence** | Unverified evidence displays `Self-Reported` badges. Automated verification engine checks GitHub commits/repos before assigning `VERIFIED`. | Verified (Tested in `PublicPortfolioPage.test.tsx` & `EmployerApplicationReviewPage.test.tsx`) |
| **Prompt Injection Defenses** | Input sanitization, override pattern regexes, and XML tag boundaries prevent candidate prompt injection attacks. | Verified (Tested in `test_security_prompt_injection.py`) |
| **Multi-Tenant Isolation** | Employer organization membership is validated at the database query level before assessing applications. | Verified (Tested in `ai.test.ts`) |
| **Fault Tolerance / Optional AI** | Node API implements circuit breaker fallback to keyword similarity when the Python microservice is down. | Verified (Tested in `ai.test.ts`) |

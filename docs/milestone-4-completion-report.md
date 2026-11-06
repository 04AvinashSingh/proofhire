# Milestone 4 — Job Creation, Evaluation Rubrics, and Anti-Ghosting Application Lifecycle Completion Report

**Date:** 2026-10-21  
**Milestone:** 4 — Job Creation, Evaluation Rubrics, and Anti-Ghosting Application Lifecycle  
**Status:** `COMPLETED`  

---

## 1. Executive Summary

Milestone 4 delivers the core matching and lifecycle infrastructure for ProofHire: **structured job creation with technical evaluation rubrics, evidence-based candidate applications, an auditable finite state machine, and a transparent Anti-Ghosting Service Level Agreement (SLA)**.

Key accomplishments:
- **Relational Schema & Drizzle Migrations:** Designed and generated migrations for `jobs`, `job_requirements` (structured rubric criteria), `applications`, `evidence_mappings` (requirement-to-artifact mapping), `application_status_history` (tamper-evident audit trail), and `evaluation_notes` (strictly isolated reviewer deliberations).
- **ADR-007 (Application Lifecycle & Anti-Ghosting SLA):** Formalized and implemented the finite state machine (`APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `HIRED`, `REJECTED`) with server-side validation, transition reason requirements for un-rejecting, and 7-day review SLAs.
- **Strict Separation of Private Notes (Security Invariant):** Evaluation notes are stored separately and explicitly excluded from all candidate-facing queries and DTOs, ensuring internal employer feedback and deliberations never leak over the network.
- **Evidence-to-Requirement Mapping:** Candidates do not submit generic resumes; they submit specific code projects, git commits, and design artifacts mapped directly to the employer's structured rubric requirements.
- **Platform Rule #7 (Zero Automated Rejection):** State transitions are executed solely by authorized human reviewers; no algorithmic filter or automated scoring makes or recommends final candidate rejection.
- **Modern Responsive Web Client:**
  - `JobExplorePage`: Discover published opportunities with SLA guarantees and requirement badges.
  - `JobDetailPage`: Review technical rubrics and submit applications with evidence mapping.
  - `CandidateApplicationsPage`: Transparent stage progress stepper, real-time 7-day SLA countdown (`ON_TRACK`, `AT_RISK`, `BREACHED`), and status history timeline.
  - `EmployerJobsPage` & `EmployerJobEditorPage`: Organization job management and rubric criteria builder with evidence type hints.
  - `EmployerApplicationReviewPage`: Requirement-to-evidence matrix, state-machine transition controls, and private evaluation notes studio.

---

## 2. Test Execution & Verification

A total of **86 automated tests** pass cleanly across 16 test suites in the monorepo:

| Workspace | Test Suite | Passed | Status |
|---|---|---|---|
| `@proofhire/shared-contracts` | `index.test.ts` (Auth, Portfolio, Jobs, Applications, State Machine, SLAs) | 12/12 | ✅ Passed |
| `@proofhire/api` | `applications.test.ts` (State machine, transitions, SLA calculation, private notes isolation) | 8/8 | ✅ Passed |
| `@proofhire/api` | `jobs.test.ts` (Job CRUD, rubrics, status transitions, public discovery) | 6/6 | ✅ Passed |
| `@proofhire/api` | `candidates.test.ts` (Profile, Skills, Projects, Evidence, Visibility) | 8/8 | ✅ Passed |
| `@proofhire/api` | `storageService.test.ts` (Path traversal, MIME validation, 10MB limits) | 5/5 | ✅ Passed |
| `@proofhire/api` | `passwordService.test.ts` (Argon2id hashing) | 4/4 | ✅ Passed |
| `@proofhire/api` | `sessionService.test.ts` (Opaque session hashing) | 4/4 | ✅ Passed |
| `@proofhire/api` | `auth.test.ts` (Registration, login, logout, me) | 10/10 | ✅ Passed |
| `@proofhire/api` | `organisations.test.ts` (Tenant isolation & RBAC) | 7/7 | ✅ Passed |
| `@proofhire/api` | `health.test.ts` (Probes & readiness) | 3/3 | ✅ Passed |
| `@proofhire/api` | `validate.test.ts` (Zod schema validation) | 2/2 | ✅ Passed |
| `@proofhire/api` | `errorHandler.test.ts` (Centralized operational error formatting) | 2/2 | ✅ Passed |
| `@proofhire/web` | `JobExplorePage.test.tsx` (Search, filtering, SLA indicators, requirement tags) | 3/3 | ✅ Passed |
| `@proofhire/web` | `CandidateApplicationsPage.test.tsx` (SLA tracking, stage stepper, status history) | 3/3 | ✅ Passed |
| `@proofhire/web` | `PublicPortfolioPage.test.tsx` (Portfolio views, Rule #8 notice, contributions) | 5/5 | ✅ Passed |
| `@proofhire/web` | `App.test.tsx` (App shell, navigation, authenticated states) | 4/4 | ✅ Passed |
| **Total** | **16 Test Suites** | **86/86** | ✅ **100% Passing** |

### Monorepo Quality Gates:
- `npm run typecheck` (`tsc --noEmit` across `@proofhire/shared-contracts`, `@proofhire/api`, `@proofhire/web`): **0 errors, Exit code 0**
- `npm run test` (vitest across all packages): **86/86 passed, Exit code 0**
- `npm run build` (tsc -b, tsc, vite build): **0 errors, Exit code 0**

---

## 3. Architecture & Security Invariants Maintained

1. **Anti-Ghosting SLA Invariant:**
   - Applications automatically receive an SLA review deadline of `createdAt + 7 days`.
   - SLA status is dynamically calculated: `ON_TRACK` (> 48h remaining), `AT_RISK` ($\le$ 48h remaining), `BREACHED` (deadline passed without action in pending states), `MET` (terminal state reached).
   - Displayed transparently to candidates on their applications dashboard.
2. **Deterministic State Machine Enforcement:**
   - Illegal status transitions (e.g. `APPLIED` $\to$ `OFFER`) are rejected with HTTP 400 (`INVALID_STATUS_TRANSITION`).
   - Transition from `REJECTED` back to `SCREENING` strictly enforces an explicit reason.
   - All transitions write an immutable entry to `application_status_history` recording `fromStatus`, `toStatus`, `changedBy`, timestamp, and reason.
3. **Private Evaluation Notes Isolation:**
   - Candidate queries omit the `evaluation_notes` relation. Candidate DTOs contain zero note fields.
   - Employer evaluation endpoints verify organization membership before reading or writing notes.
4. **Platform Rule #7 (Zero Automated Rejection):**
   - The platform strictly enforces human-in-the-loop decisions. No automated process or AI model rejects candidates.
5. **Platform Rule #8 (Self-Reported Evidence):**
   - Candidate project evidence linked to job requirements continues to be labeled with explicit "Self-Reported" badges and disclosures.

---

## 4. Next Milestone

**Milestone 5 — AI Service, Semantic Matching, pgvector, and Verification Pipeline**
- Setup and scaffolding of `apps/ai-service` (FastAPI, Python).
- Semantic matching between job requirement rubrics and candidate evidence submissions using vector embeddings (`pgvector`).
- AI-assisted evidence summarization and relevance explanations (advisory to human reviewers only, adhering to Rule #7).
- Prompt injection defenses and threat modeling.
- *Prerequisite note:* Ensure Python 3.11+ is active in the environment prior to starting `apps/ai-service`.

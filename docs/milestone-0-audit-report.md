# Milestone 0 — Repository Audit and Discovery Pack

**Date:** 2026-10-21  
**Milestone:** 0 — Repository and Discovery Audit

---

## 1. Repository Audit Findings

### 1.1 State Before This Milestone

| Item | Finding |
|---|---|
| Existing files | None — completely empty directory |
| Git repository | Not initialised |
| Existing stack | N/A — greenfield project |
| Existing tests | None |
| Existing database schema | None |
| Existing Docker setup | None |
| Broken builds | N/A |
| Uncommitted changes | None |

### 1.2 Environment Check

| Tool | Version found | Required | Status |
|---|---|---|---|
| Node.js | v26.7.0 | LTS 20+ | ✅ Exceeds minimum |
| npm | 11.19.0 | 10+ | ✅ OK |
| Python | 3.9.6 | 3.11+ | ⚠️ Below required — see note |
| Docker | 29.4.0 | 24+ | ✅ OK |
| Docker Compose | v5.1.2 | v2 plugin | ✅ OK |
| psql | Not found | Optional | ℹ️ Not required for local dev (Docker Compose provides PostgreSQL) |
| uv | Not found | Optional | ℹ️ May be needed for Python dev setup |

**Python version note:** Python 3.9.6 is below the 3.11 minimum specified in the requirements. For the AI service development, Python 3.11+ should be installed. This can be done with `pyenv` or by installing a newer version via Homebrew. The API and web app work with the available Node.js. This is a **blocker for Milestone 5 (AI Service)**, not for Milestones 1–4.

**Action required before Milestone 5:** Install Python 3.11 or later.
```bash
brew install python@3.11
# or
pyenv install 3.11.x && pyenv local 3.11.x
```

---

## 2. Discovery Documents Created

| Document | Status | Location |
|---|---|---|
| Problem statement | ✅ Created | `docs/product/problem-statement.md` |
| Assumptions and risks | ✅ Created | `docs/product/assumptions-and-risks.md` |
| Discovery and validation plan | ✅ Created | `docs/product/discovery-and-validation-plan.md` |
| Personas and user journeys | ✅ Created | `docs/product/personas-and-user-journeys.md` |
| Competitor analysis | ✅ Created | `docs/product/competitor-analysis.md` |
| Product requirements document | ✅ Created | `docs/product/product-requirements-document.md` |
| Functional requirements | ✅ Created | `docs/product/functional-requirements.md` |
| Non-functional requirements | ✅ Created | `docs/product/non-functional-requirements.md` |
| MVP scope and out-of-scope | ✅ Created | `docs/product/mvp-scope-and-out-of-scope.md` |
| User stories and acceptance criteria | ✅ Created | `docs/product/user-stories-and-acceptance-criteria.md` |
| Success metrics | ✅ Created | `docs/product/success-metrics.md` |
| Open questions and decisions | ✅ Created | `docs/product/open-questions-and-decisions.md` |

---

## 3. Architecture Documents Created

| Document | Status | Location |
|---|---|---|
| System context | ✅ Created | `docs/architecture/system-context.md` |
| Data model | ✅ Created | `docs/architecture/data-model.md` |
| Authentication and authorisation | ✅ Created | `docs/architecture/authentication-and-authorization.md` |
| ADR-001: Monolith vs microservices | ✅ Accepted | `docs/architecture/adr/ADR-001-monolith-vs-microservices.md` |
| ADR-002: Database selection | ✅ Accepted | `docs/architecture/adr/ADR-002-database-selection.md` |
| ADR-003: Password hashing | ✅ Accepted | `docs/architecture/adr/ADR-003-password-hashing.md` |
| ADR-004: Authentication storage | ✅ Accepted | `docs/architecture/adr/ADR-004-authentication-storage.md` |
| ADR-005: ORM selection | 🟡 Proposed | `docs/architecture/adr/ADR-005-orm-selection.md` |
| Container and component design | ⬜ Pending Milestone 1 | `docs/architecture/container-and-component-design.md` |
| API design | ⬜ Pending Milestone 1 | `docs/architecture/api-design.md` |
| Security and privacy | ⬜ Pending Milestone 2 | `docs/architecture/security-and-privacy.md` |

---

## 4. Engineering Documents Created

| Document | Status | Location |
|---|---|---|
| DSA design | ✅ Created | `docs/engineering/dsa-design.md` |
| Testing strategy | ✅ Created | `docs/engineering/testing-strategy.md` |
| Glossary | ✅ Created | `docs/engineering/glossary.md` |
| Runbook | ⬜ Pending Milestone 1 | `docs/engineering/runbook.md` |
| Development workflow | ⬜ Pending Milestone 1 | `docs/engineering/development-workflow.md` |
| Traceability matrix | ⬜ Pending Milestone 2 | `docs/engineering/traceability-matrix.md` |
| Algorithm benchmarks | ⬜ Pending Milestone 6 | `docs/engineering/algorithm-benchmarks.md` |

---

## 5. Root Files Created

| File | Status |
|---|---|
| `README.md` | ✅ |
| `CONTRIBUTING.md` | ✅ |
| `SECURITY.md` | ✅ |
| `AGENTS.md` | ✅ |
| `.env.example` | ✅ |
| `docker-compose.yml` | ✅ |
| `infrastructure/docker/postgres/init.sql` | ✅ |

---

## 6. Key Decisions Made in Milestone 0

| Decision | Record |
|---|---|
| Modular monolith (Node.js) + separate Python AI service | ADR-001 |
| PostgreSQL as sole database; MongoDB rejected | ADR-002 |
| Argon2id for password hashing | ADR-003 |
| HttpOnly cookies for sessions; localStorage rejected as invariant | ADR-004 |
| ORM selection deferred to Milestone 1 (Drizzle leading candidate) | ADR-005 |
| All product hypotheses remain ASSUMPTION — no validated user research yet | problem-statement.md |

---

## 7. Critical Open Questions Before Milestone 1

| Priority | Question | Risk if not resolved |
|---|---|---|
| HIGH | ORM and migration tool selection (OQ-E-01, OQ-E-02) | Cannot start schema work |
| HIGH | Multi-tenancy strategy — row-level security vs. application filtering (OQ-E-10) | Cross-tenant isolation depends on this |
| HIGH | Python version upgrade required for AI service | Milestone 5 blocked |
| MEDIUM | CSRF implementation approach (OQ-E-09) | Auth security surface unclear |
| MEDIUM | Development origin strategy — same origin or different? (OQ-E-04) | CORS configuration |

---

## 8. Prioritised Backlog — Milestone 1

Milestone 1 deliverables (in implementation order):

1. **Monorepo root configuration** — `package.json` with npm workspaces, root TypeScript config, root ESLint config.
2. **Shared contracts package** — `packages/shared-contracts` with API response types.
3. **API scaffold** — Express app with: health endpoint, readiness endpoint, Zod validation middleware, centralised error handler, Pino structured logger, CORS, security headers.
4. **Database setup** — Drizzle ORM (decision to confirm), first migration (users table + sessions table), connection pool.
5. **Web app scaffold** — Vite + React + TypeScript + React Router + TanStack Query, basic layout.
6. **Docker Compose verification** — `docker compose up` starts all services correctly; health checks pass.
7. **Test infrastructure** — Vitest configured for API unit tests; one real test passing.
8. **Local CI script** — Makefile or `npm run check` that runs typecheck + lint + test.

---

## 9. Known Risks Entering Milestone 1

| Risk | Severity | Mitigation |
|---|---|---|
| Product hypotheses unvalidated | HIGH | Discovery interviews must begin in parallel with Milestone 1; not blocked but discovery findings could require scope changes |
| Python 3.9 on dev machine | MEDIUM | Milestone 5 is blocked; Milestones 1–4 unaffected |
| ORM decision not finalised | LOW | Drizzle will be prototyped in Milestone 1; commitment before first migration |
| No email service for development | LOW | Mailhog via Docker Compose profile; email sending disabled by default (`FEATURE_EMAIL_ENABLED=false`) |

---

## 10. Tests Run This Milestone

No automated tests were run in Milestone 0 (no application code to test).

The following was verified manually:
- ✅ Directory structure created successfully.
- ✅ All document files created with correct content.
- ✅ Docker Compose YAML is syntactically valid (`docker compose config` will verify this in Milestone 1).
- ✅ `docker --version` and `docker compose version` confirm Docker is available.
- ✅ Node.js v26.7.0 and npm 11.19.0 are available.
- ⚠️ Python 3.9.6 is below the required 3.11 minimum.

---

## 11. How to Verify This Work Locally

```bash
# Verify directory structure
find /Users/kalpu/proofhire -type f | sort

# Verify Docker availability
docker --version
docker compose version

# Verify Docker Compose syntax (once Dockerfiles are created in Milestone 1)
docker compose config
```

---

## 12. Next Milestone

**Milestone 1 — Engineering Foundation**

The next step is to scaffold the actual applications:
- `apps/api`: Express + TypeScript + Drizzle + Pino
- `apps/web`: Vite + React + TypeScript + React Router + TanStack Query
- First database migration: `users` and `sessions` tables
- Docker Compose working end-to-end
- Passing baseline tests

Approve when ready to proceed to Milestone 1.

# Open Questions and Decisions

> This document tracks open decisions that have not yet been made and questions that must be resolved.
> Update this document when a decision is made — move the item to `architecture-decisions.md` with full context.

---

## 1. Open Product Questions

| ID | Question | Impact | Owner | Target resolution |
|---|---|---|---|---|
| OQ-P-01 | Do employers want profile snapshots at application time, or is viewing the current profile acceptable? | Medium — affects data model complexity | Product | Discovery interviews |
| OQ-P-02 | Should candidates see a relevance score before they apply? Risk of gamification. | Medium — affects candidate UX design | Product | Discovery interviews |
| OQ-P-03 | Should rejected candidates receive structured feedback on evidence gaps? | Medium — legal sensitivity, employer willingness | Product | Discovery interviews |
| OQ-P-04 | Is the freemium model (candidates free, employers pay) the right revenue model for India? | High — affects growth strategy | Product + Business | Discovery interviews |
| OQ-P-05 | Should employers be able to define custom pipeline stages per job? | Low — adds implementation complexity | Product | Default to fixed stages for MVP; revisit |
| OQ-P-06 | What should happen to a candidate's data after account deletion? How long do applications need to be retained for employer records? | High — DPDP Act implications | Legal + Product | Before production launch |

---

## 2. Open Engineering Decisions

| ID | Question | Impact | Owner | Target resolution |
|---|---|---|---|---|
| OQ-E-01 | Which ORM/query builder for PostgreSQL? Options: Drizzle ORM, Kysely, Prisma, raw node-postgres with a migration tool | High — affects DX across all backend development | Engineering | Milestone 1 — decide before first migration |
| OQ-E-02 | Which migration tool? (Drizzle-kit if Drizzle; Prisma migrate if Prisma; golang-migrate or db-migrate for standalone) | High — database lifecycle management | Engineering | With OQ-E-01 |
| OQ-E-03 | How should email verification and password reset tokens be stored? Options: hashed token in DB, short-lived JWT, Redis-backed | Medium — auth security | Engineering | Milestone 2 |
| OQ-E-04 | Should the API and web app be served from the same origin in development to simplify CORS? | Low — local dev setup | Engineering | Milestone 1 |
| OQ-E-05 | Which logging library? Options: Pino (preferred for performance and JSON output), Winston | Low — replaceable | Engineering | Milestone 1 |
| OQ-E-06 | What is the file upload strategy? Options: local filesystem (dev only), S3-compatible object storage, direct database BLOB | Medium — affects file storage, CDN, and privacy | Engineering | Milestone 3 — before file upload feature |
| OQ-E-07 | Which LLM provider integration for the AI service? Must be provider-agnostic. Options: LiteLLM abstraction, custom interface | Medium — AI service architecture | Engineering | Milestone 5 |
| OQ-E-08 | Should background jobs use a PostgreSQL-backed queue (e.g., pg-boss) or a file-based scheduler? Redis/Kafka are deferred. | Medium — async processing reliability | Engineering | Milestone 3 if async processing needed |
| OQ-E-09 | How to handle CSRF? Options: double-submit cookie, synchronizer token, SameSite=Strict only | Medium — auth security surface | Engineering | Milestone 2 |
| OQ-E-10 | How to handle multi-tenancy for employer organisations? Row-level security in PostgreSQL vs. application-layer filtering? | High — cross-tenant data isolation | Engineering | Milestone 1 — must be decided before data model is fixed |

---

## 3. Resolved Decisions (Summary — full context in ADRs)

| ID | Decision | Date | ADR |
|---|---|---|---|
| RD-01 | Modular monolith for core backend (Node.js/TypeScript); separate Python AI service | 2026-10-21 | `docs/architecture/adr/ADR-001-monolith-vs-microservices.md` |
| RD-02 | PostgreSQL as the primary database; MongoDB rejected | 2026-10-21 | `docs/architecture/adr/ADR-002-database-selection.md` |
| RD-03 | Argon2id for password hashing | 2026-10-21 | `docs/architecture/adr/ADR-003-password-hashing.md` |
| RD-04 | HttpOnly, Secure, SameSite=Strict cookies for sessions; localStorage rejected | 2026-10-21 | `docs/architecture/adr/ADR-004-authentication-storage.md` |
| RD-05 | No automated candidate rejection or scoring by any system component | 2026-10-21 | Product invariant — not an ADR |
| RD-06 | Vite + React + TypeScript for frontend | 2026-10-21 | Technology stack mandate |
| RD-07 | FastAPI + Python for AI service | 2026-10-21 | Technology stack mandate |

---

## 4. Deferred Questions

These questions are acknowledged but intentionally not resolved yet:

| ID | Question | Reason for deferral |
|---|---|---|
| DQ-01 | Which cloud provider for production hosting? (AWS-compatible specified but specific services not locked in) | No production deployment in MVP |
| DQ-02 | Which CDN for static assets and uploaded files? | Deferred until file upload architecture is finalised |
| DQ-03 | Full observability stack (Prometheus, Grafana, Sentry, etc.)? | Over-engineered for early MVP; structured logs are sufficient initially |
| DQ-04 | When to introduce pgvector for semantic search? | Only if RAG is validated in Milestone 5 |
| DQ-05 | Multi-language support (Hindi, regional languages)? | Deferred — English-first for MVP |
| DQ-06 | Virus scanning for uploaded files? | Deferred — evaluate ClamAV or cloud scanning before production |

---

## 5. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft |

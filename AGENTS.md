# ProofHire — Agent Instructions

This file documents conventions for AI coding assistants working in this repository.

---

## Repository Rules

1. **Inspect before modifying.** Read the relevant existing file before editing it.
2. **Plan before substantial changes.** For any change affecting data model, auth, or API contracts — read the relevant docs first.
3. **No secrets in source.** Never write API keys, passwords, or credentials into any source file.
4. **Document decisions.** If you make a significant architecture decision, create or update an ADR in `docs/architecture/adr/`.
5. **Mark unverified claims.** Use the classification labels: `VALIDATED`, `ASSUMPTION`, `PROPOSED`, `DECIDED`, `DEFERRED`.
6. **No fabricated test results.** Never claim a test passed unless it was actually executed.
7. **No automated rejection.** The system must never make or recommend final hiring decisions.
8. **Self-reported evidence is self-reported.** Never describe candidate evidence as "verified" unless it has been independently verified.

---

## Key Design Invariants

- Passwords are hashed with Argon2id. Never store or log plaintext passwords.
- Sessions are stored in HttpOnly, Secure, SameSite=Strict cookies. Never in localStorage.
- Every API handler enforces object-level authorisation before returning data.
- The AI service is optional. Core workflows function without it.
- Candidate evaluation notes are never visible to candidates.
- Audit events are immutable. Never add a DELETE endpoint for audit_events.
- Cross-tenant isolation: an employer's API session must never return another organisation's private data.

---

## Current Milestone

**Milestone 6 — Production Hardening, End-to-End Workflows, Performance & Observability, and Deployment Readiness** (COMPLETED)
- Complete end-to-end integration test (`e2e-workflow.test.ts`) covering candidate portfolio creation, job rubrics, application submission, Anti-Ghosting SLA tracking, automated verification, grounded AI evaluation, and employer deliberation
- Cryptographic tamper-resistant audit logging (`audit_events`) with hash-chain verification (`computeAuditHash`, `verifyChainIntegrity`)
- Production security hardening: enhanced CSP, HSTS, and frameguard headers via Helmet; double-submit CSRF protection; global API rate limiting; and SSRF protection for external URLs
- Observability: Prometheus metrics (`/metrics`) for both Node.js API and Python AI service; structured logging with correlation IDs (`x-request-id`)
- Zero-downtime database migration strategy and production Docker orchestration: `ADR-009`, multi-stage production Dockerfiles, and `docker-compose.prod.yml`
- Invariants verified: 131 automated tests passing across 23 test suites; 0 TypeScript errors; 0 build errors

---

## Relevant Documentation

Before modifying major areas, read:

| Area | Document |
|---|---|
| Data model | `docs/architecture/data-model.md` |
| Auth design | `docs/architecture/authentication-and-authorization.md` |
| Architecture decisions | `docs/architecture/adr/` |
| Product requirements | `docs/product/product-requirements-document.md` |
| MVP scope | `docs/product/mvp-scope-and-out-of-scope.md` |
| Open questions | `docs/product/open-questions-and-decisions.md` |

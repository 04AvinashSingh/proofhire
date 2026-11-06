# Security and Privacy Architecture

**Date:** 2026-10-21  
**Milestone:** 2 — Identity, Access, and Tenant Isolation  
**Status:** `DECIDED`

---

## 1. Security Invariants & Guarantees

ProofHire enforces non-negotiable security invariants designed to protect candidate privacy and maintain employer tenant isolation:

1. **Argon2id Password Hashing (ADR-003):**
   - Memory-hard password hashing using the `@node-rs/argon2` native binding.
   - OWASP 2024 recommended parameters: `memoryCost: 64MB`, `timeCost: 3`, `parallelism: 4`.
   - Plaintext passwords are never logged, stored, or returned in API responses.
   - Verification uses constant-time comparison to prevent timing attacks.

2. **Opaque HttpOnly Session Management (ADR-004):**
   - Session tokens are 32 bytes (64 hex characters) of cryptographically random entropy.
   - Raw tokens are never stored in PostgreSQL; only their SHA-256 hash is persisted.
   - Transmitted exclusively via `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=7200` cookies.
   - Strict rejection of `localStorage` token storage to mitigate XSS session hijacking.

3. **Double-Submit CSRF Defence:**
   - In addition to `SameSite=Strict`, all state-changing endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) require an `x-csrf-token` header matching the `proofhire_csrf` cookie value.

4. **Multi-Tenant Isolation:**
   - Every employer resource query is scoped by the caller's verified membership in `organisation_memberships`.
   - An employer cannot view, list, or mutate another organization's jobs, candidates, or private notes.
   - Object-level authorization checks are executed prior to returning any entity.

5. **Rate Limiting:**
   - In-memory sliding window rate limiting on sensitive endpoints:
     - `/auth/login`: 5 attempts per IP per 15 minutes.
     - `/auth/register`: 10 attempts per IP per 1 hour.

---

## 2. Privacy & Data Protection (DPDP Act Alignment)

- Candidate profiles have configurable visibility: `PUBLIC`, `APPLIED_ONLY`, `PRIVATE`.
- Candidate evaluation notes written by hiring teams are strictly internal and never exposed to the candidate.
- All timestamps are UTC with timezone (`TIMESTAMPTZ`).
- Database cascade rules ensure session invalidation upon user deletion or account suspension.

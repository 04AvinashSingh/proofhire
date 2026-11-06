# ADR-005: ORM and Migration Tool Selection

**Date:** 2026-10-21  
**Status:** Accepted (Milestone 1)

---

## Context

The core backend requires a database access layer for querying PostgreSQL and a migration tool for schema management. The choice affects developer experience, type safety, query expressiveness, and migration lifecycle management.

---

## Decision

**Drizzle ORM + drizzle-kit is ACCEPTED as the ORM and schema migration tool for ProofHire.**

### Rationale:
1. **TypeScript-first schema as code:** Schema is defined natively in TypeScript files (`src/db/schema/*`), avoiding secondary DSLs (like `.prisma`) and out-of-sync code generation steps.
2. **Deterministic, reviewable SQL migrations:** `drizzle-kit generate` produces clean, standard PostgreSQL DDL migrations (e.g. `0000_*.sql`) that can be reviewed in git, tracked in version control, and executed via standard migration runners.
3. **Strict type inference:** Table schemas automatically yield exact TypeScript types for query results (`$inferSelect`) and insertion payloads (`$inferInsert`).
4. **Lightweight runtime:** Uses native `pg.Pool` directly without a heavy query engine binary or memory footprint.
5. **Validated in Milestone 1:** Validated by implementing `users`, `sessions`, `organisations`, `organisation_memberships`, and `candidate_profiles` schemas, generating migration SQL, and executing schema tests successfully.

---

## Revisit Conditions

- Selected ORM cannot express a required query without resorting to unsafe raw SQL.
- Significant performance regression attributed to the ORM abstraction layer.
- The library becomes unmaintained.

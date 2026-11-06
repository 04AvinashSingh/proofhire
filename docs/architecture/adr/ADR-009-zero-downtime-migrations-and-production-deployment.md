# ADR-009: Zero-Downtime Database Migrations and Production Deployment Strategy

**Date:** 2026-10-31  
**Status:** Accepted  
**Deciders:** Architecture, Engineering, and DevOps Teams  

---

## Context

As ProofHire transitions from MVP to production readiness in Milestone 6, continuous deployments must not disrupt candidates submitting applications or employers reviewing evidence. 

In PostgreSQL, unmanaged schema migrations can cause severe production outages:
1. **Exclusive Table Locks:** Operations like standard `CREATE INDEX` or `ALTER TABLE ... ADD CONSTRAINT` lock tables against concurrent reads or writes.
2. **Column Renaming / Deletion:** Renaming or removing columns immediately breaks running application instances that still expect the old schema.
3. **Container Restarts:** Deploying new container images without graceful connection draining terminates in-flight candidate submissions.

---

## Decision

We accept a formal **Zero-Downtime Deployment & Migration Architecture** adhering to the following rules:

### 1. Expand / Contract Migration Pattern

All schema modifications that alter existing structures must follow the three-phase Expand/Contract pattern:

```
┌──────────────────────────────────────────────────────────┐
│  Phase 1: Expand                                         │
│  - Add new nullable column or new table                  │
│  - Both Old App (v1) and New App (v2) run concurrently   │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│  Phase 2: Migrate / Backfill                             │
│  - New App (v2) writes to new structure                  │
│  - Background script backfills existing rows             │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│  Phase 3: Contract                                       │
│  - v1 is completely decommissioned                       │
│  - Apply NOT NULL constraints and drop deprecated fields │
└──────────────────────────────────────────────────────────┘
```

### 2. Non-Blocking DDL Invariants
- **Indexes:** In production, indexes must be created with `CREATE INDEX CONCURRENTLY` to prevent table write locks.
- **Constraints:** Foreign keys and check constraints must be added with `NOT VALID` followed by `VALIDATE CONSTRAINT` in a separate transaction, avoiding table lock contention.
- **Default Values:** New columns must be added as `NULL` or with constant defaults (`DEFAULT 'value'`), which in PostgreSQL 11+ is an instantaneous metadata-only operation.

### 3. Graceful Connection Draining
The Node.js API (`apps/api`) and Python AI service (`apps/ai-service`) implement explicit `SIGTERM` and `SIGINT` signal handlers:
- Stop accepting new inbound HTTP requests.
- Allow currently executing requests to finish within a 15-second grace period.
- Close database connection pools (`pool.end()`) cleanly.
- Exit process with code 0.

### 4. Container Health & Readiness Gates
- **Liveness (`/health`):** Verifies the process is alive. Fails if the event loop is hung.
- **Readiness (`/ready`):** Verifies database connectivity and dependency health before the orchestrator (Docker/Kubernetes) routes external traffic to the container.

---

## Consequences

### Positive
- Deployments can happen during working hours without downtime or maintenance windows.
- In-flight applications and evidence submissions are preserved during container rollouts.
- Failed deployments can be rolled back safely because migrations in the Expand phase remain backward-compatible with the previous software version.

### Trade-offs & Mitigations
- Requires multi-step deployments for breaking schema changes (two PRs instead of one). This overhead is standard and necessary for 99.9% uptime.

---

## Revisit Conditions

This architecture shall be revisited if:
- Database size exceeds 1TB, requiring automated partitioning or sharding.
- Read/write split architecture (read replicas) is introduced.


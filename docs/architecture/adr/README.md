# Architecture Decision Records — Index

This directory contains Architecture Decision Records (ADRs) for ProofHire.

ADRs document significant architectural decisions: the context, options considered, the decision made, and its consequences.

## Format

Each ADR is a markdown file named `ADR-NNN-short-title.md` where NNN is a zero-padded three-digit number.

**ADR template:**
```
# ADR-NNN: Title

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNN  
**Deciders:** [roles or team]

## Context
What is the problem or situation that prompted this decision?

## Options Considered
### Option A
Pros / Cons

### Option B
Pros / Cons

## Decision
What was decided and why.

## Consequences
What does this mean going forward? What becomes easier? What becomes harder?

## Revisit Conditions
Under what circumstances should this decision be revisited?
```

---

## Index of ADRs

| ADR | Title | Status |
|---|---|---|
| [ADR-001](ADR-001-monolith-vs-microservices.md) | Modular monolith vs microservices for core backend | Accepted |
| [ADR-002](ADR-002-database-selection.md) | PostgreSQL as primary database | Accepted |
| [ADR-003](ADR-003-password-hashing.md) | Argon2id for password hashing | Accepted |
| [ADR-004](ADR-004-authentication-storage.md) | HttpOnly cookies for session storage | Accepted |
| [ADR-005](ADR-005-orm-selection.md) | ORM and migration tool selection | Accepted |
| [ADR-006](ADR-006-artifact-storage.md) | Artifact upload and storage strategy | Accepted |
| [ADR-007](ADR-007-application-lifecycle-and-sla.md) | Application lifecycle state machine and anti-ghosting SLA | Accepted |
| [ADR-008](ADR-008-ai-service-and-rag-pipeline.md) | AI Service Architecture, Grounded RAG Pipeline, and Prompt Injection Defenses | Accepted |
| [ADR-009](ADR-009-zero-downtime-migrations-and-production-deployment.md) | Zero-Downtime Database Migrations and Production Deployment Strategy | Accepted |


# ADR-002: PostgreSQL as Primary Database

**Date:** 2026-10-21  
**Status:** Accepted  
**Deciders:** Engineering team

---

## Context

ProofHire needs a database for storing candidate profiles, employer organisations, job listings, applications, evidence metadata, evaluation notes, audit events, and session data. The data has strong relational structure with important integrity constraints (e.g., one application per candidate per job; evidence must belong to a project that belongs to a candidate).

---

## Options Considered

### Option A: PostgreSQL
A mature, ACID-compliant relational database with strong support for constraints, transactions, JSON columns (for flexible schema where needed), full-text search, and (via pgvector extension) vector similarity search.

**Pros:**
- Enforces referential integrity through foreign keys and unique constraints.
- ACID transactions ensure consistency across related operations (e.g., creating a job and its requirements, or updating application state with history record).
- Excellent tooling: mature ORM/query builder support, migration tools, monitoring tools.
- pgvector extension provides vector similarity search without a separate vector database.
- Full-text search (GIN/GiST indexes on `tsvector`) can power job and candidate search without Elasticsearch in MVP.
- Strong community, extensive documentation, and cloud-managed options (AWS RDS, Supabase, Neon) if needed later.

**Cons:**
- Schema migrations are required for structural changes.
- Not the right tool for unstructured, document-heavy workloads.

### Option B: MongoDB
A document-oriented database.

**Pros:**
- Flexible schema — easy to add fields without migrations.
- Familiar to many developers.

**Cons:**
- Hiring data has strong relational structure. Enforcing "one application per candidate per job" in MongoDB requires application-level logic or a unique index — both more fragile than a PostgreSQL unique constraint with a foreign key.
- Joins are replaced with `$lookup` aggregations or application-side joining, which is less expressive and harder to optimise for complex queries.
- ACID transactions exist in MongoDB since v4.0 but are not the natural usage pattern and introduce overhead.
- Does not reduce complexity — just shifts it from relational constraints to application code.
- No native vector search comparable to pgvector without Atlas Vector Search (cloud-only, paid).

**Decision:** MongoDB is rejected. The core data model is relational. Choosing MongoDB for familiarity would trade database-enforced integrity for application-enforced integrity, which is less reliable.

### Option C: Separate PostgreSQL + Separate Vector Database (Pinecone, Weaviate, Qdrant)
PostgreSQL for relational data; a dedicated vector database for AI retrieval.

**Pros:**
- Best-in-class vector search performance.

**Cons:**
- Over-engineering for an MVP where AI features are not yet validated.
- Additional operational dependency.
- pgvector is sufficient for the scale and retrieval complexity expected in MVP.

**Decision:** Defer to Milestone 5. If pgvector proves insufficient, migrate the vector index to a dedicated service. Do not add a vector database before it is needed.

---

## Decision

**PostgreSQL is the primary and only database in the MVP.**

pgvector will be enabled as an extension only when semantic search or RAG is implemented in Milestone 5.

All relational integrity constraints (primary keys, foreign keys, unique constraints, check constraints) are enforced at the database level, not only in application code.

---

## Consequences

**Easier:**
- Consistent, reliable data integrity without complex application-side workarounds.
- SQL transactions spanning multiple tables are straightforward.
- A single monitoring and backup strategy.
- Future migration to managed PostgreSQL (AWS RDS, Neon) requires no application changes.

**Harder:**
- Schema changes require migrations — this is a feature, not a limitation.
- Very flexible or deeply nested document structures are less convenient (use JSONB columns where appropriate).

---

## Revisit Conditions

- AI retrieval performance with pgvector is demonstrably insufficient for the retrieval workload.
- A specific use case emerges that PostgreSQL cannot serve without significant operational cost.

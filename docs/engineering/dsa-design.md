# DSA Design — ProofHire

> This document records the real engineering problems that require careful algorithm or data structure choices.
> It does not contain artificial LeetCode-style problems inserted into business logic.
> Every algorithm decision is tied to a concrete product requirement.

---

## 1. Candidate–Job Evidence Matching

### 1.1 Product Problem

When an employer opens an application, the system must present each job requirement alongside the candidate's evidence that is relevant to it. This is the core differentiator of ProofHire. The matching must be:
- Deterministic (same candidate + same job = same mapping, always)
- Transparent (the employer can see why an item was matched)
- Fast enough to not block the review workflow (under 200ms for the matching computation itself)
- Correct when no evidence exists (show "No evidence found", never fabricate)

### 1.2 Algorithm Design

**Input:**
- A job's requirements: `R = [r1, r2, ..., rn]` — each with `skill_tags: string[]`
- A candidate's project evidence items: `E = [e1, e2, ..., em]` — each with `skill_tags: string[]`

**Step 1: Build a skill-to-evidence inverted index**

```
skillIndex: Map<string, Set<EvidenceId>>
```

For each evidence item `ei`, for each skill tag `t` in `ei.skill_tags`:
```
skillIndex.get(t) ?? skillIndex.set(t, new Set())
skillIndex.get(t).add(ei.id)
```

**Time complexity:** O(m × avg_tags_per_evidence) — linear in total skill-tag assignments.  
**Space complexity:** O(m × avg_tags) for the index.

This is a standard inverted index construction — the same data structure used in full-text search engines, applied here to skill tags.

**Step 2: Score each evidence item against each requirement**

For each requirement `ri` with `skill_tags: T_r`:
1. Find candidate evidence items whose skill_tags overlap with `T_r` by looking up each tag in `skillIndex`.
2. For each matching evidence item, compute a Jaccard similarity score:

```
score(evidence, requirement) = |tags(evidence) ∩ tags(requirement)| / |tags(evidence) ∪ tags(requirement)|
```

Jaccard is appropriate here because:
- It penalises very broad evidence with many irrelevant tags (intersection/union, not just intersection/requirement).
- It is bounded [0, 1] and interpretable.
- It is symmetric and does not require training data.

**Step 3: Select top-k evidence items per requirement**

Use a max-heap to select the top-k (k=3 by default) evidence items per requirement without sorting the full set.

```
For each requirement ri:
  heap = MaxHeap(capacity=3, comparator=by_score)
  for each candidate evidence item ei in matching_set:
    if score(ei, ri) > 0:
      heap.push({ evidenceId: ei.id, score: score(ei, ri) })
  mappings[ri.id] = heap.toSortedArray()
```

**Time complexity:** O(n × m × avg_tags) in the worst case (all evidence matches all requirements), where n = number of requirements, m = number of evidence items. In practice: n ≤ 20 (job requirements), m ≤ 50 per candidate — total operations: ≤ 1000 × tag_size. Not a performance problem.

**Step 4: Handle missing evidence**

If no evidence item has a non-zero score for a requirement, the mapping entry is:
```
{ requirementId, evidenceItems: [], missingEvidence: true }
```

This is the honest, correct response. The system never invents an evidence item or a score.

### 1.3 Where This Runs

For MVP: computed in-application (Node.js) when the employer opens an application, cached in `evidence_mappings` table.

The computation is fast enough (sub-millisecond for typical n × m sizes) that pre-computation is not required. We cache the result to avoid re-computing on every page load and to preserve a snapshot of the mapping at a point in time.

### 1.4 Correctness Invariants

- `score` is always in [0, 1].
- `missingEvidence: true` is set if and only if no evidence item has a score > 0 for that requirement.
- The mapping for a requirement with an empty tag set returns `missingEvidence: true` for all evidence.
- Removing evidence from a profile and recomputing yields the updated mapping (no stale cache for missing evidence without explicit re-compute).

### 1.5 Tests Required

- Unit test: Jaccard score is correct for overlapping, non-overlapping, and identical tag sets.
- Unit test: Top-k selection returns correct items when more than k evidence items match.
- Unit test: Missing evidence is correctly identified when no skills overlap.
- Unit test: Requirements with no skill tags produce `missingEvidence: true` for all evidence.
- Integration test: Evidence mapping persists correctly in `evidence_mappings` table.
- Integration test: Recomputing after profile update yields updated mapping.

### 1.6 Alternatives Considered

| Alternative | Why not used |
|---|---|
| Cosine similarity on TF-IDF vectors of requirement and evidence text | Requires training data or pre-trained embeddings; non-deterministic without a fixed model version; harder to explain to employers |
| Vector embeddings + pgvector | Deferred to Milestone 5 (AI features); adds LLM dependency for a baseline matching feature |
| Full PostgreSQL-only JOIN on skill_tags arrays | Possible with GIN index + `&&` overlap operator; good for filtering but less expressive for per-requirement top-k selection |

---

## 2. Application State Machine

### 2.1 Product Problem

An application moves through a defined lifecycle: Applied → Screening → Interview → Offer → Hired/Rejected. Invalid transitions (e.g., moving a Hired application to Screening) must be rejected. Concurrent employer actions must not create inconsistent state.

### 2.2 Algorithm: Explicit Transition Table

```typescript
type ApplicationStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';

const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED:    ['SCREENING', 'REJECTED'],
  SCREENING:  ['INTERVIEW', 'REJECTED'],
  INTERVIEW:  ['OFFER', 'REJECTED'],
  OFFER:      ['HIRED', 'REJECTED'],
  HIRED:      [],          // Terminal state
  REJECTED:   ['SCREENING'],  // Reopening — requires explicit reason
};

function isValidTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
```

**Data structure:** Hash map of arrays. Lookup is O(1) for the map key, O(k) for the array scan where k ≤ 2 (maximum branching factor). Effectively O(1).

### 2.3 Concurrency

The state machine must be safe under concurrent employer actions. Use an optimistic concurrency pattern:

```sql
UPDATE applications
SET status = $new_status, updated_at = NOW()
WHERE id = $application_id
  AND status = $expected_current_status  -- optimistic lock check
RETURNING id, status;
```

If the row is not returned (zero rows updated), the current status was not what the caller expected — the server returns `409 Conflict`. The caller retries with the actual current state.

This avoids explicit `SELECT FOR UPDATE` locking in the common case and is appropriate for the expected concurrency level (one employer action at a time per application).

### 2.4 Tests Required

- Unit test: All valid transitions pass `isValidTransition`.
- Unit test: All invalid transitions fail.
- Unit test: Reopening from REJECTED requires a reason.
- Integration test: Concurrent transition from the same state — one succeeds, one gets 409.
- Integration test: Every successful transition creates an entry in `application_status_history`.

---

## 3. Job Search Filtering and Pagination

### 3.1 Product Problem

Candidates search for jobs by skills, employment type, location, and remote options. The result set must be paginated, consistently ordered, and fast even as the number of jobs grows.

### 3.2 Algorithm Design

**Filtering:** Pushed entirely into PostgreSQL via indexed query predicates.

```sql
SELECT j.*, o.name AS organisation_name
FROM jobs j
JOIN organisations o ON j.organisation_id = o.id
WHERE j.status = 'PUBLISHED'
  AND ($skill_filter::text[] IS NULL OR j.required_skills && $skill_filter)
  AND ($employment_type IS NULL OR j.employment_type = $employment_type)
  AND ($remote_type IS NULL OR j.remote_type = $remote_type)
  AND ($location_country IS NULL OR j.location_country = $location_country)
ORDER BY j.published_at DESC
LIMIT $page_size
OFFSET $offset;
```

**Indexes used:**
- Partial index on `(published_at DESC) WHERE status = 'PUBLISHED'` — avoids scanning draft and archived jobs.
- GIN index on `required_skills` for the `&&` overlap operator.

**Pagination:** Offset-based for MVP.
- Offset pagination is simple, correct, and consistent with the expected data volumes.
- Cursor-based pagination is evaluated in Milestone 6 if result set sizes or update frequency cause significant page-drift issues.

**Complexity:** O(log n) for the index scan + O(page_size) for the result projection. Not application-side — fully database-side.

### 3.3 Tests Required

- Integration test: Skill filter returns only jobs with matching skill tags.
- Integration test: Published-only filter never returns DRAFT or CLOSED jobs.
- Integration test: Pagination offset returns correct page.
- Performance test: `EXPLAIN ANALYZE` on a dataset of 10,000 jobs verifies index usage.

---

## 4. Duplicate Application Prevention

### 4.1 Product Problem

A candidate must not apply to the same job twice. This must be enforced even if two concurrent requests are submitted.

### 4.2 Algorithm

No custom algorithm required. This is solved by a **database unique constraint**:

```sql
UNIQUE (job_id, candidate_id)
```

When a duplicate INSERT is attempted (even concurrently), PostgreSQL rejects it with a unique violation error. The application catches this error and returns `409 Conflict` with a user-friendly message.

**Why not application-layer checking?**
A `SELECT` followed by `INSERT` (check-then-act) is a classic TOCTOU race condition. The unique constraint is atomic and correct under all concurrency levels.

### 4.3 Tests Required

- Integration test: Second application to the same job returns 409.
- Integration test: Concurrent requests — only one succeeds, the other gets 409.

---

## 5. Benchmark Methodology

All benchmarks must follow this protocol before results are reported:

1. **Describe the dataset:** size, distribution, how it was generated.
2. **Describe the hardware:** machine spec, memory, OS.
3. **Describe warm-up:** number of warm-up runs before measurement.
4. **Report meaningful statistics:** p50, p95, p99 latency; throughput (ops/sec).
5. **Include memory:** if the algorithm is memory-intensive.
6. **Include the correctness check:** benchmarks that produce wrong answers do not count.
7. **Compare against the baseline:** always measure what you are replacing.
8. **Report SQL query plans:** for database-side algorithms, include `EXPLAIN ANALYZE` output.

> **No benchmark results are recorded in this document yet.** All benchmarks are to be run in Milestone 6 on realistic synthetic datasets. Claiming performance improvements without measurements is prohibited.

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft — algorithm designs specified; no benchmarks run yet |

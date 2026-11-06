# ADR-007: Application Lifecycle State Machine and Anti-Ghosting SLA Tracking

**Date:** 2026-10-21  
**Status:** Accepted  
**Deciders:** Engineering & Product Teams  

---

## Context

Traditional tech hiring processes suffer from two systemic failures:
1. **Candidate Ghosting:** Candidates submit applications and portfolios into an opaque "black hole", receiving no response or progress updates for weeks or months.
2. **Unenforced Stage Transitions:** Arbitrary status jumps (e.g. going directly from `APPLIED` to `OFFER` without screening) create audit gaps, compliance issues, and prevent accurate SLA measurement.
3. **Data Leaks of Reviewer Deliberations:** Internal reviewer discussions, skepticism, or compensation considerations must remain strictly confidential to employer team members and never leak to candidates.

To establish ProofHire as a high-trust hiring platform, we require:
- A strictly enforced state machine for application progress.
- An auditable Anti-Ghosting Service Level Agreement (SLA) with transparent timeframes.
- Strict architectural isolation between candidate-facing application status and private employer evaluation notes.

---

## Options Considered

### Option A: Ad-Hoc Status String with Loose Timestamps
Allow any status string to be assigned to an application, and calculate delays through unstructured query filters.

**Pros:**
- Simple to implement initially.
- High flexibility for employers to invent custom stages.

**Cons:**
- High risk of invalid state transitions (skipping evaluation stages, un-rejecting without recorded reasons).
- Impossible to guarantee anti-ghosting SLAs programmatically.
- No immutable audit trail of who changed status, when, and why.

### Option B: Deterministic Finite State Machine with SLA Tracking & Isolated Notes (Selected)
Define strict state machine rules in shared contracts, validate transitions on both client and API server, record every transition in an immutable `application_status_history` table, enforce a 7-day review SLA (`ON_TRACK`, `AT_RISK`, `BREACHED`), and maintain private employer evaluation notes in a distinct, tenant-isolated table never joined in candidate queries.

**Pros:**
- Complete transparency for candidates regarding SLA adherence without leaking internal notes.
- Invariant integrity: Server rejects illegal transitions with `400 Bad Request` (`INVALID_STATUS_TRANSITION`).
- Full auditability: Every transition records `fromStatus`, `toStatus`, `changedBy`, timestamp, and optional or mandatory reason.
- Guarantees Platform Rule #7: Only authorized human reviewers can trigger state transitions; zero automated rejections.

**Cons:**
- More upfront domain logic and relational schema complexity.

---

## Decision

We accept **Option B** and adopt the following architectural specifications:

1. **Finite State Machine Definition:**
   - Allowed statuses: `APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `HIRED`, `REJECTED`.
   - Valid forward transitions:
     - `APPLIED` $\to$ `SCREENING`, `REJECTED`
     - `SCREENING` $\to$ `INTERVIEW`, `REJECTED`
     - `INTERVIEW` $\to$ `OFFER`, `REJECTED`
     - `OFFER` $\to$ `HIRED`, `REJECTED`
   - Re-opening policy:
     - `REJECTED` $\to$ `SCREENING` is permitted **only** when accompanied by an explicit, non-empty `reason` string explaining why the candidate is being reconsidered.
   - Terminal states: `HIRED` is terminal.

2. **Anti-Ghosting SLA Invariant:**
   - On submission, an application is automatically assigned a review deadline of `createdAt + 7 days`.
   - SLA statuses are computed deterministically:
     - `ON_TRACK`: More than 48 hours remaining until deadline.
     - `AT_RISK`: 48 hours or less remaining until deadline in non-terminal states.
     - `BREACHED`: Current time exceeds `slaDeadline` in `APPLIED` or `SCREENING` states without employer action.
     - `MET`: Terminal state reached before the deadline.
   - Candidates see their real-time SLA countdown and stage stepper on the candidate dashboard.

3. **Private Evaluation Notes Isolation Invariant:**
   - Evaluation notes are stored in `evaluation_notes` linked to `(application_id, author_id)`.
   - The candidate application retrieval queries (`/api/v1/applications/my-applications` and `/api/v1/applications/:id`) explicitly exclude the `evaluation_notes` relationship.
   - Only authenticated members of the employer organization associated with the job can access or create evaluation notes.

4. **Zero Automated Rejection (Rule #7):**
   - No algorithmic score, filter, or automated pipeline trigger is permitted to transition an application to `REJECTED`. All rejections require human initiation.

---

## Consequences

- Predictable, tamper-evident application lifecycles.
- Candidates have visibility into employer response SLAs, eliminating hiring ghosting.
- Internal employer discussions remain secure and confidential.
- Immutable audit log provides compliance transparency for both parties.

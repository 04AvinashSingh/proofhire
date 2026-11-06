# Problem Statement

> **Classification key**
> - `VALIDATED` — supported by external evidence we can cite
> - `ASSUMPTION` — plausible but not yet verified by ProofHire's own research
> - `PROPOSED` — a recommendation awaiting approval
> - `DECIDED` — explicit product or engineering decision
> - `DEFERRED` — intentionally postponed

---

## 1. Background

Software hiring for early-career engineers in India and comparable markets relies heavily on credentials, self-reported project work, and brief technical screen calls. Employers often receive many applications with limited signal on actual engineering ability, while candidates struggle to differentiate themselves beyond a résumé and GitHub profile.

> Status: `ASSUMPTION` — no ProofHire interviews have been conducted yet. The above reflects commonly reported pain points in publicly available developer community discussions.

---

## 2. Core Hypotheses

**H1 — Candidate communication gap**
Early-career software developers find it difficult to communicate the relevance and quality of their practical skills through a résumé alone, because:
- Projects may be team efforts with unclear individual contribution.
- GitHub repositories do not distinguish a project author from a collaborator who made one commit.
- Self-reported skill lists (React, Node.js, SQL) provide no context on depth of application.
- Most portfolios contain descriptions rather than structured, evidence-linked claims.

**H2 — Employer evaluation inefficiency**
Employers hiring junior developers spend significant time reviewing applications that are difficult to compare, because:
- Applications arrive in inconsistent formats.
- Job requirements are rarely decomposed into discrete, evaluable criteria.
- There is no structured mechanism for mapping a candidate's demonstrated work to a specific requirement.
- Screening criteria are often implicit, leading to interviewer-to-interviewer inconsistency.

**H3 — Evidence quality gap**
Neither candidates nor employers have a shared, structured vocabulary for "what demonstrates competency in X at a junior level". Without this, even well-intentioned candidates do not know what evidence to collect and present.

> Status of H1, H2, H3: `ASSUMPTION` — must be tested with 12–15 candidate interviews and 8–10 hiring-stakeholder interviews before significant feature investment.

---

## 3. Proposed Solution

ProofHire is a platform that connects each job requirement to the evidence a candidate provides:
- Clearly distinguishes self-reported claims from independently checkable evidence.
- Identifies missing, weak, or inconclusive evidence explicitly — never fabricates support.
- Leaves hiring decisions entirely with the employer.
- Makes the evaluation process transparent to both parties.

> Status: `PROPOSED` — subject to revision once user interviews surface actual friction points.

---

## 4. Scope Boundaries

| In scope | Out of scope (MVP) |
|---|---|
| Early-career software engineers (0–2 years) | Experienced engineers, non-software roles |
| India as primary launch market | Other geographies in MVP |
| Candidate to employer hiring workflow | B2B ATS integrations, agency workflows |
| Evidence-to-requirement mapping | Automated scoring, AI-led candidate rejection |

---

## 5. What This Document Is Not

This document does not constitute validated market research. It captures hypotheses that the Discovery and Validation Plan will test. Results will update this document with `VALIDATED` classifications where evidence is gathered.

---

## 6. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft — all claims classified as ASSUMPTION |

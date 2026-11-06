# Assumptions and Risks

> All statements below are `ASSUMPTION` unless explicitly marked otherwise.
> This document feeds directly into the Validation Plan and is updated as evidence is gathered.

---

## 1. Product Assumptions

### A1 — Market existence
Early-career software developers in India are actively seeking ways to demonstrate practical skills beyond a résumé and would engage with a structured evidence platform if one existed.

**Risk level:** HIGH  
**Invalidation signal:** Candidates prefer existing methods (LinkedIn, GitHub, competitive platforms like LeetCode) and do not see evidence mapping as valuable.  
**Test:** Ask in interviews: "How do you currently prove your skills to employers? What is frustrating about that?"

---

### A2 — Employer willingness to engage with structured evidence
Employers and hiring managers at startups and early-stage companies in India would use a structured evidence interface rather than reverting to existing channels (LinkedIn recruiter, Naukri, Instahyre).

**Risk level:** HIGH  
**Invalidation signal:** Employers say they already have enough tools or that structured review adds workflow overhead they won't absorb.  
**Test:** Ask: "If a platform showed you evidence against each of your job requirements, would you use it? What would block you?"

---

### A3 — Segment focus is correct
Focusing on 0–2 year engineers is the right entry segment. Broader segments (3–5 years) or different personas (data engineers, mobile engineers) are not a better starting point.

**Risk level:** MEDIUM  
**Invalidation signal:** Most employer interest is in 2–4 year profiles; 0–2 year hiring is so price-sensitive that structured evaluation platforms cannot charge for it.

---

### A4 — Evidence quality improves hiring decisions
Having structured candidate evidence mapped to job requirements actually improves employer decision quality compared to unstructured review.

**Risk level:** MEDIUM  
**Invalidation signal:** Employers still prefer to rely on a short technical call regardless of evidence quality, so the platform does not shorten or improve the hiring process.

---

### A5 — Self-reported evidence is acceptable when clearly labelled
Employers will accept self-reported project work as a valid input when the platform clearly labels it as "Candidate-reported, not independently verified."

**Risk level:** MEDIUM  
**Invalidation signal:** Employers reject any evidence that is not cryptographically or institutionally verified, making self-reported evidence worthless on the platform.

---

### A6 — AI evidence summarisation is useful, not annoying
Candidates and employers will find AI-generated summaries of project evidence useful, not misleading or patronising.

**Risk level:** MEDIUM  
**Invalidation signal:** Users distrust AI summaries or find them inaccurate enough to be harmful.

---

## 2. Technical Assumptions

### T1 — PostgreSQL will scale for MVP
A single PostgreSQL instance will handle initial load from a small number of users (hundreds to low thousands) without requiring sharding, read replicas, or caching.

**Risk level:** LOW  
**Mitigation:** Monitor query performance from day one; add read replicas before write-path contention becomes an issue.

---

### T2 — A modular monolith is sufficient for the core backend
A well-structured Node.js/TypeScript modular monolith serves the MVP. Splitting into multiple services is premature at this stage.

**Risk level:** LOW  
**Revisit condition:** A specific module (e.g., AI service) generates load or deployment cadence that would benefit from independent scaling.

---

### T3 — The AI service can be degraded gracefully
If the Python AI service is unavailable, core hiring workflows (profiles, jobs, applications, employer review) continue without AI features.

**Risk level:** LOW  
**Mitigation:** All AI-dependent API endpoints degrade gracefully with appropriate status messages.

---

## 3. Regulatory and Privacy Assumptions

### R1 — DPDP Act (India) compliance requirements are understood
The Digital Personal Data Protection Act 2023 (India) applies to candidate personal data. The MVP will collect minimal data, obtain explicit consent, and establish a deletion workflow.

**Risk level:** HIGH  
**Action:** A legal review of DPDP obligations for a B2B SaaS hiring platform must occur before any production launch.

---

### R2 — No sensitive personal data categories will be collected in MVP
The MVP will not collect caste, religion, disability status, health information, or other sensitive personal data categories under DPDP or comparable international frameworks.

**Risk level:** LOW — by design (no such fields in the data model).

---

## 4. Business Assumptions

### B1 — Freemium or employer-pays revenue model is viable
Employers pay for access to candidate evidence review; candidates use the platform free. This is a hypothesis, not a validated revenue model.

**Risk level:** HIGH  
**Test:** Ask employers in discovery interviews: "Would you pay for this? What would be a reasonable pricing range?"

---

### B2 — Network effects are achievable without massive initial inventory
Employers will engage even with a small initial candidate pool, provided the quality of evidence is demonstrably higher than alternatives.

**Risk level:** HIGH  
**Invalidation signal:** Employers require large candidate volume before engaging, making a cold-start strategy unworkable.

---

## 5. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | Neither candidate nor employer hypothesis validated | Medium | Critical | Run discovery interviews before major feature build |
| R-02 | DPDP compliance delays launch | Medium | High | Engage legal counsel early |
| R-03 | Cold-start problem: no employers without candidates, no candidates without employers | High | High | Seed with employer partnerships before public candidate launch |
| R-04 | AI summaries contain factual errors and damage employer trust | Medium | High | Enforce source citations; add "Insufficient evidence" fallback |
| R-05 | Competitors with large networks pivot to add evidence mapping | Medium | Medium | Move fast on evidence quality differentiation |
| R-06 | Candidate fraud (fake evidence, misrepresented contributions) | Medium | High | Clear "self-reported" labelling; no automated verification claims |
| R-07 | Bias amplification through matching algorithms | Low | High | Restrict matching to job-relevant criteria; document and audit scoring |

---

## 6. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft |

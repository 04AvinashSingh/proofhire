# Product Requirements Document

> **Status:** `PROPOSED` — pending discovery interview findings.
> Requirements marked `ASSUMPTION` depend on hypotheses that have not been validated.
> Do not treat the existence of this PRD as product validation.

---

## 1. Product Overview

**Product name:** ProofHire  
**Version:** 1.0 (MVP)  
**Last updated:** 2026-10-21  
**Owner:** ProofHire Product Team

### Vision
An evidence-based hiring platform that helps early-career software developers demonstrate their practical engineering skills and helps employers evaluate candidates against explicit job requirements.

### Problem
Early-career developers struggle to differentiate themselves through résumés and unstructured portfolios. Employers struggle to evaluate candidates consistently and efficiently. The hiring process lacks a structured mechanism to connect job requirements to candidate evidence.

### Proposed Solution
A platform that maps candidate project evidence to job requirements, clearly distinguishing self-reported claims from verified facts, and identifying missing or insufficient evidence without fabricating support.

---

## 2. Goals and Non-Goals

### Goals (MVP)
- Enable candidates to create structured profiles with project evidence.
- Enable employers to define structured job requirements.
- Map candidate evidence to job requirements and surface gaps.
- Provide a transparent, auditable application pipeline.
- Ensure the product is safe, private, and accessible.

### Non-Goals (explicitly out of MVP scope)
- Automated candidate rejection or scoring.
- AI video interviewing or emotion detection.
- Invasive proctoring.
- ATS integrations with third-party systems.
- General job board for all professions.
- Large microservices architecture.
- Social networking features.

---

## 3. User Segments

| Segment | Definition |
|---|---|
| Candidate | Software developer with 0–2 years of professional experience |
| Employer | Startup founder, engineering manager, or technical recruiter hiring early-career engineers |
| Administrator | Authorised platform operations team member |

---

## 4. High-Level Requirements

### 4.1 Candidate requirements

| ID | Requirement | Status |
|---|---|---|
| C-01 | Register and sign in securely | `DECIDED` |
| C-02 | Create and edit a professional profile | `DECIDED` |
| C-03 | Add skills, education, and experience | `DECIDED` |
| C-04 | Add project descriptions with contribution context | `DECIDED` |
| C-05 | Attach project URLs, GitHub repositories, live demos | `DECIDED` |
| C-06 | Explain personal contribution to team projects | `DECIDED` |
| C-07 | Distinguish self-reported from verified information | `DECIDED` |
| C-08 | Search and discover suitable jobs | `DECIDED` |
| C-09 | View job requirements before applying | `DECIDED` |
| C-10 | Submit an application | `DECIDED` |
| C-11 | Track application status | `DECIDED` |
| C-12 | Control profile visibility | `ASSUMPTION` — need to validate importance |

### 4.2 Employer requirements

| ID | Requirement | Status |
|---|---|---|
| E-01 | Register an employer account and organisation | `DECIDED` |
| E-02 | Create, edit, publish, and close job listings | `DECIDED` |
| E-03 | Define required and preferred skills per job | `DECIDED` |
| E-04 | View and manage applications | `DECIDED` |
| E-05 | Review candidate profiles and project evidence | `DECIDED` |
| E-06 | View evidence mapped against job requirements | `DECIDED` — core differentiator |
| E-07 | Record evaluation notes with access controls | `DECIDED` |
| E-08 | Move candidates through a defined pipeline | `DECIDED` |
| E-09 | View pipeline metrics | `ASSUMPTION` — validate whether this is used in MVP |
| E-10 | Invite team members to an organisation | `DECIDED` |

### 4.3 Evidence mapping requirements

| ID | Requirement | Status |
|---|---|---|
| EM-01 | For each job requirement, show: the requirement, available evidence, evidence source, relevance rationale, limitations, self-reported vs. verified status | `DECIDED` — core differentiator |
| EM-02 | Identify missing evidence explicitly | `DECIDED` |
| EM-03 | Never fabricate evidence or infer capabilities not in evidence | `DECIDED` — safety invariant |
| EM-04 | Do not make automated hiring or rejection decisions | `DECIDED` — ethical invariant |

### 4.4 Platform administration requirements

| ID | Requirement | Status |
|---|---|---|
| AD-01 | Manage reports and abusive content | `DECIDED` |
| AD-02 | Handle account restrictions | `DECIDED` |
| AD-03 | Maintain auditable records of administrative actions | `DECIDED` |
| AD-04 | Privacy-conscious operational visibility | `DECIDED` |

---

## 5. Quality Attributes

| Attribute | Requirement |
|---|---|
| Security | Authentication, authorisation, input validation, CSRF protection, secure headers, no secrets in source |
| Privacy | DPDP Act (India) compliance, explicit consent, data deletion capability, minimal data collection |
| Accessibility | WCAG 2.1 AA compliance target |
| Performance | Page load under 3s on a 4G connection; API responses under 500ms for simple queries |
| Reliability | Core hiring workflow functions without AI service; graceful degradation |
| Maintainability | TypeScript strict mode; modular architecture; documented decisions |
| Testability | Unit, integration, API contract, and end-to-end tests; CI enforces passing tests |
| Observability | Structured logs, correlation IDs, health endpoints, error tracking |

---

## 6. Constraints

| Constraint | Detail |
|---|---|
| Technology | TypeScript (frontend + backend), Python (AI service), PostgreSQL — per master build prompt |
| Budget | Local development only; no cloud infrastructure costs to be incurred without explicit approval |
| Team | Treated as a small engineering team; no dedicated QA or security staff initially |
| Launch market | India; DPDP Act 2023 applies |
| AI ethics | No automated rejection; no protected-characteristic inference; decisions remain with humans |

---

## 7. Dependencies

| Dependency | Risk |
|---|---|
| Discovery interview results | HIGH — product scope may change significantly |
| DPDP Act legal review | HIGH — required before production launch |
| LLM provider selection (AI service) | MEDIUM — must be provider-agnostic |
| PostgreSQL + pgvector (if RAG used) | LOW — mature technology |

---

## 8. Open Decisions

See `open-questions-and-decisions.md` for current open items.

---

## 9. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft — pending discovery validation |

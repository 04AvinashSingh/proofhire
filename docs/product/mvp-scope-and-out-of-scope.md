# MVP Scope and Out of Scope

> Status: `PROPOSED` — scope must be confirmed against discovery validation findings.
> All items are subject to revision if discovery interviews surface materially different needs.

---

## 1. MVP Principles

1. **Build the smallest thing that demonstrates the core value proposition** — evidence-to-requirement mapping — and can be used by real candidates and employers.
2. **Every feature included in the MVP must be necessary to test at least one of the three core hypotheses** (H1, H2, H3).
3. **Infrastructure complexity must be justified by actual requirements**, not anticipated scale.
4. **AI features are supporting capability, not the core product** — the hiring workflow must function without them.
5. **No deferred feature is "coming soon"** — we do not communicate unavailable functionality to users.

---

## 2. In Scope — MVP

### 2.1 Authentication and Accounts
- [x] Candidate registration, login, logout, password reset
- [x] Employer registration, login, logout, password reset
- [x] Email verification
- [x] Role-based access control (Candidate / Employer / Admin)
- [x] Organisation creation and membership (Owner, Admin, Member)
- [x] Session management with HttpOnly cookies
- [x] Rate limiting on authentication endpoints

### 2.2 Candidate Profile
- [x] Profile creation and editing (bio, location, status)
- [x] Education entries (multi-entry)
- [x] Work experience entries (multi-entry)
- [x] Skills with proficiency and self-reported labelling
- [x] Project creation with personal contribution explanation
- [x] Project evidence: URLs, GitHub repos, uploaded documents (PDF), written descriptions
- [x] Profile visibility controls (Public / Applied employers only / Private)

### 2.3 Employer and Jobs
- [x] Organisation profile
- [x] Team member invitations
- [x] Job creation, editing, publishing, closing
- [x] Structured job requirements (required vs. preferred, evidence type hints)
- [x] Job lifecycle management (Draft / Published / Closed / Archived)

### 2.4 Applications
- [x] Job search and filtering (skills, type, location)
- [x] Application submission (one per candidate per job, enforced by DB constraint)
- [x] Application state machine (Applied → Screening → Interview → Offer → Hired/Rejected)
- [x] Candidate application status view
- [x] Employer application list and review

### 2.5 Evidence-to-Requirement Mapping (Core Differentiator)
- [x] Per-requirement view showing: requirement, evidence, source, relevance, missing-evidence flag
- [x] Self-reported vs. verified label on each evidence item
- [x] Deterministic baseline matching (skill tag overlap, keyword relevance)
- [x] "Insufficient evidence" identification — no fabrication

### 2.6 Employer Review
- [x] Evidence-mapped application review interface
- [x] Internal evaluation notes (text, per application, visible to org members)
- [x] Pipeline stage updates with status history
- [x] Basic pipeline metrics (application counts per stage)

### 2.7 Platform Administration
- [x] Content reporting
- [x] Account restriction (warning / suspension / ban)
- [x] Audit event logging
- [x] Admin dashboard (aggregate metrics, no individual browsing of candidate data)

### 2.8 Infrastructure
- [x] Docker Compose local development environment
- [x] PostgreSQL with migrations
- [x] Health and readiness endpoints
- [x] Structured logging
- [x] Environment-based configuration with `.env.example`
- [x] Unit, integration, and API contract tests
- [x] Local CI (lint, type check, test) via a Makefile or similar

---

## 3. Explicitly Out of Scope — MVP

### 3.1 AI Features (Milestone 5 — deferred pending evidence)
- [ ] AI-powered evidence summarisation
- [ ] Retrieval-augmented generation (RAG) for evidence retrieval
- [ ] Vector search with pgvector
- [ ] AI-generated relevance explanations
- [ ] Prompt injection defences (implementation deferred — threat model created now)

### 3.2 Advanced Hiring Features
- [ ] Structured interview scheduling
- [ ] Video interviews of any kind
- [ ] Automated candidate scoring or ranking
- [ ] AI-driven candidate rejection
- [ ] Personalised job recommendations (collaborative filtering or ML-based)
- [ ] Post-rejection feedback to candidates

### 3.3 Platform Expansion
- [ ] Support for non-software engineering roles
- [ ] Support for candidates with > 2 years experience
- [ ] International markets (initial design must not break for them, but UI/UX is India-first)
- [ ] Multi-language support (English only in MVP)

### 3.4 Integrations
- [ ] ATS integrations (Greenhouse, Lever, Workday)
- [ ] LinkedIn import
- [ ] GitHub OAuth and automated repository analysis
- [ ] Google/LinkedIn SSO (email/password only in MVP)
- [ ] Automated code review or static analysis of submitted repositories

### 3.5 Infrastructure and Operations
- [ ] Production cloud deployment (documented; not executed without explicit approval)
- [ ] Kubernetes / container orchestration
- [ ] Redis caching layer (evaluate if query performance requires it)
- [ ] Message queues (Kafka, RabbitMQ) — use PostgreSQL-backed job table if async processing needed
- [ ] CDN configuration
- [ ] Monitoring dashboards (documented; full observability stack is post-MVP)

### 3.6 Business Features
- [ ] Payments and subscription management
- [ ] Invoice generation
- [ ] Employer analytics beyond basic pipeline metrics
- [ ] Candidate analytics
- [ ] Referral or affiliate system
- [ ] Custom pipeline stages per job

---

## 4. Deferred Pending Discovery Validation

These items are neither in scope nor fully out of scope — they depend on interview findings:

| Feature | Assumption it depends on | Decision point |
|---|---|---|
| Profile snapshot at application time | Employers care about profile state at application, not current state | Discovery finding — validate employer mental model |
| Custom pipeline stages | Employers have materially different pipeline steps per job | Discovery finding — validate whether default stages cover 80%+ of cases |
| Candidate-visible relevance score | Candidates find "how well do I match this job?" useful | Discovery finding — risk of gaming the score |
| Candidate feedback on rejection | Employers are willing to provide structured feedback | Discovery finding — legal and cultural sensitivity |

---

## 5. The "Not a Job Board" Constraint

ProofHire must not be marketed or designed as a general job board. Specific design constraints:
- The homepage must emphasise evidence quality, not volume of jobs.
- The job listing UI must foreground job requirements and evidence mapping, not just job title and company.
- The candidate profile must foreground project evidence, not just skills listed as tags.
- Marketing copy must not claim features that do not exist.

---

## 6. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft |

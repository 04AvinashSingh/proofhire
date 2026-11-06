# User Stories and Acceptance Criteria

> All stories are `PROPOSED` unless marked `DECIDED`.
> Stories derived from unvalidated hypotheses are flagged `ASSUMPTION`.

---

## Epic 1: Authentication

### US-AUTH-01 — Candidate Registration
**As a** job-seeking developer,  
**I want to** create a ProofHire account with my email and password,  
**so that** I can build my profile and apply to jobs.

**Acceptance Criteria:**
- [ ] AC-01: I can submit an email and password on the registration form.
- [ ] AC-02: If I submit a duplicate email, I receive a clear error: "An account with this email already exists."
- [ ] AC-03: If my password does not meet the minimum requirements, I see an inline validation message before submission.
- [ ] AC-04: After successful registration, I receive a verification email within 2 minutes.
- [ ] AC-05: I cannot apply to jobs until I verify my email.
- [ ] AC-06: My password is never returned in any API response.
- [ ] AC-07: Registration with an invalid email format (no `@` domain) fails with a validation error.

---

### US-AUTH-02 — Employer Registration
**As a** hiring manager,  
**I want to** register as an employer,  
**so that** I can post jobs and review applications.

**Acceptance Criteria:**
- [ ] AC-01: I select "Employer" account type at registration.
- [ ] AC-02: Registration requires email, password, full name, and company name.
- [ ] AC-03: Email verification is required before I can publish a job.
- [ ] AC-04: After registration, I am prompted to complete my organisation profile.

---

### US-AUTH-03 — Sign In
**As a** registered user,  
**I want to** sign in with my email and password,  
**so that** I can access my account.

**Acceptance Criteria:**
- [ ] AC-01: Correct credentials issue a session cookie (HttpOnly, Secure, SameSite=Strict).
- [ ] AC-02: Incorrect credentials return a generic error: "Invalid email or password" (no user enumeration).
- [ ] AC-03: After 5 failed attempts within 15 minutes, I am rate-limited and told to try again later.
- [ ] AC-04: I can sign out; my session is invalidated on the server.
- [ ] AC-05: After sign-out, my browser session cookie is cleared.

---

### US-AUTH-04 — Password Reset
**As a** user who forgot my password,  
**I want to** reset it via email,  
**so that** I can regain access to my account.

**Acceptance Criteria:**
- [ ] AC-01: I can request a reset link by entering my email. The UI shows the same message whether or not the email exists (no enumeration).
- [ ] AC-02: The reset link expires after 1 hour.
- [ ] AC-03: The reset link is single-use; a second click shows an "expired or already used" error.
- [ ] AC-04: After password reset, all existing sessions are invalidated.

---

## Epic 2: Candidate Profile

### US-CAND-01 — Create Profile
**As a** candidate,  
**I want to** build a profile that describes my background and skills,  
**so that** employers can understand who I am before reviewing my evidence.

**Acceptance Criteria:**
- [ ] AC-01: I can add: name, bio (max 500 characters), location, current status.
- [ ] AC-02: I can save a partial profile and return to complete it later.
- [ ] AC-03: My profile shows a completeness indicator (visible to me only).
- [ ] AC-04: An empty profile is not published to employer search.

---

### US-CAND-02 — Add Project with Evidence
**As a** candidate,  
**I want to** document a project I worked on and attach evidence of my contribution,  
**so that** employers can evaluate my actual work, not just my claims.

**Acceptance Criteria:**
- [ ] AC-01: I can create a project with: name, description, role, team size (if team project), GitHub URL, project URL.
- [ ] AC-02: I must provide a text description of my specific contribution.
- [ ] AC-03: The form prompts me to distinguish "I built this solo" from "I was one of N contributors."
- [ ] AC-04: I can attach evidence items: uploaded PDF (max 10MB), external URL, video link, written explanation.
- [ ] AC-05: Every evidence item is displayed with a "Self-reported — not independently verified" label.
- [ ] AC-06: I can attach multiple evidence items to one project.
- [ ] AC-07: I can link a project to one or more of my skills.

---

### US-CAND-03 — Control Profile Visibility
**As a** candidate,  
**I want to** control who can see my profile,  
**so that** I can protect my privacy while I am employed and only looking casually.

**Acceptance Criteria (ASSUMPTION — validate importance):**
- [ ] AC-01: I can set visibility to: Public (all employers), Applied Employers Only, Private.
- [ ] AC-02: Private profiles do not appear in employer candidate search.
- [ ] AC-03: Employers can view my profile only if I have applied to their job and they are a member of that organisation.

---

## Epic 3: Jobs

### US-EMP-01 — Create a Job with Structured Requirements
**As an** engineering manager,  
**I want to** define a job with explicit, structured requirements,  
**so that** the platform can map candidate evidence to what I am actually looking for.

**Acceptance Criteria:**
- [ ] AC-01: I can create a job with: title, description, employment type, location, salary range (optional).
- [ ] AC-02: I can add requirements: requirement text, importance (Required / Preferred), evidence type hint.
- [ ] AC-03: A job can have 1–20 requirements.
- [ ] AC-04: The job is saved as `DRAFT` and not visible to candidates until I publish it.
- [ ] AC-05: I can preview the job listing before publishing.
- [ ] AC-06: I can edit a `DRAFT` job. A `PUBLISHED` job allows editing of description and requirements but not title (to preserve application integrity).

---

### US-EMP-02 — Publish and Close a Job
**As an** employer,  
**I want to** publish my job listing so candidates can apply, and close it when I am done,  
**so that** I control when applications are accepted.

**Acceptance Criteria:**
- [ ] AC-01: Publishing a job makes it appear in candidate job search.
- [ ] AC-02: I cannot publish a job without at least one structured requirement.
- [ ] AC-03: Closing a job hides it from candidate search but preserves all existing applications.
- [ ] AC-04: I cannot publish a job if my organisation's email is unverified.

---

## Epic 4: Applications

### US-APP-01 — Apply to a Job
**As a** candidate,  
**I want to** apply to a job,  
**so that** the employer can review my evidence against their requirements.

**Acceptance Criteria:**
- [ ] AC-01: I can apply to any published job with a single action.
- [ ] AC-02: I cannot apply to the same job twice (I see an error: "You have already applied to this job").
- [ ] AC-03: I can add an optional cover note (max 1000 characters).
- [ ] AC-04: After applying, I can see the application in my applications list with status "Applied."
- [ ] AC-05: I cannot apply to a closed job.

---

### US-APP-02 — Track Application Status
**As a** candidate,  
**I want to** see the current stage of my application,  
**so that** I know whether I am still being considered.

**Acceptance Criteria:**
- [ ] AC-01: I can see a list of all my applications with current stage name and last-updated date.
- [ ] AC-02: I receive a notification (in-app, email TBD) when my application stage changes.
- [ ] AC-03: I cannot see employer evaluation notes.

---

### US-APP-03 — Review Application with Evidence Mapping
**As an** employer,  
**I want to** review a candidate's application with their evidence mapped against my job requirements,  
**so that** I can make a consistent, informed evaluation without reading the entire profile manually.

**Acceptance Criteria:**
- [ ] AC-01: For each job requirement, I see: the requirement text, relevant candidate evidence items, evidence source name, relevance explanation, self-reported/verified label.
- [ ] AC-02: Requirements with no matching evidence are clearly flagged as "No evidence found."
- [ ] AC-03: I can see the candidate's project descriptions and contribution explanations alongside the evidence items.
- [ ] AC-04: I can see the candidate's full profile from the same view.
- [ ] AC-05: I can record evaluation notes that are saved to the application (not visible to the candidate).
- [ ] AC-06: I can move the application to the next pipeline stage.
- [ ] AC-07: The evidence mapping is deterministic — the same candidate and job always produce the same mapping output.

---

## Epic 5: Administration

### US-ADMIN-01 — Report Content
**As a** user,  
**I want to** report abusive or false content,  
**so that** the platform maintains integrity.

**Acceptance Criteria:**
- [ ] AC-01: I can report a job listing or candidate profile from the relevant page.
- [ ] AC-02: My report includes a reason category and optional detail text.
- [ ] AC-03: I receive a confirmation that my report was received.
- [ ] AC-04: I cannot see reports submitted by other users.

---

### US-ADMIN-02 — Restrict an Account
**As an** administrator,  
**I want to** restrict a user account,  
**so that** I can respond to policy violations.

**Acceptance Criteria:**
- [ ] AC-01: I can issue a warning, temporary suspension, or permanent ban.
- [ ] AC-02: The action is logged in the audit event table with my administrator ID, reason, and timestamp.
- [ ] AC-03: A suspended user receives an appropriate message on login.
- [ ] AC-04: I cannot restrict an account without providing a reason.
- [ ] AC-05: A permanent ban cannot be reversed by a non-Owner administrator.

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft |

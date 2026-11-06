# Functional Requirements

> Status of all requirements: `PROPOSED` unless marked `DECIDED`.
> Requirements depend on discovery validation — see `assumptions-and-risks.md`.

---

## Module 1: Authentication and Account Management

### FR-AUTH-01 — User registration
- Candidates and employers can register with an email address and password.
- Email addresses must be unique per user type (or globally unique — `DECIDED`: globally unique email prevents cross-role confusion).
- Passwords must meet minimum strength requirements (min 12 characters, at least one uppercase, one lowercase, one digit, one special character).
- Passwords must be hashed using Argon2id before storage.
- Plain-text passwords must never appear in logs, error messages, or API responses.

### FR-AUTH-02 — Email verification
- After registration, the user receives an email verification link.
- Unverified accounts can browse but cannot apply to jobs or publish job listings.
- Verification links expire after 24 hours.

### FR-AUTH-03 — User sign-in
- Users authenticate with email and password.
- Successful login issues a session token stored in an HttpOnly, Secure, SameSite=Strict cookie.
- Authentication tokens are not stored in localStorage or sessionStorage.
- Failed login attempts are rate-limited (max 5 attempts per 15 minutes per IP).

### FR-AUTH-04 — Session management
- Sessions expire after a configurable idle timeout (default: 2 hours).
- Users can explicitly sign out; the server invalidates the session.
- Concurrent sessions from multiple devices are allowed (reviewable in the future).

### FR-AUTH-05 — Password reset
- Users can request a password-reset link sent to their registered email.
- Reset links expire after 1 hour and are single-use.
- Password reset invalidates existing sessions.

### FR-AUTH-06 — Role assignment
- Users have a primary role: `CANDIDATE` or `EMPLOYER`.
- Administrators have a separate `ADMIN` role assigned only by a system administrator.
- Users cannot self-assign the ADMIN role.

---

## Module 2: Candidate Profile

### FR-CAND-01 — Profile creation
- A candidate can create a profile with: full name, short bio, location (city, country), years of experience, current status (student / actively looking / open to opportunities).

### FR-CAND-02 — Education
- A candidate can add multiple education entries: institution name, degree, field of study, start and end years, description.

### FR-CAND-03 — Work experience
- A candidate can add professional experience entries: company name, role title, employment type (full-time / internship / freelance / part-time), start and end dates, responsibilities, technologies used.

### FR-CAND-04 — Skills
- A candidate can add skills with self-assessed proficiency level (Beginner / Intermediate / Advanced).
- Skill entries are self-reported and displayed with a "Self-reported" label.
- A skill can optionally link to one or more project evidence items.

### FR-CAND-05 — Projects
- A candidate can create project entries with: project name, description, role in the project (sole developer / lead / contributor / reviewer), team size if applicable, project URL, GitHub URL, live demo URL, technical documentation URL.
- A candidate must explicitly describe their personal contribution for team projects.
- Projects display a "Self-reported — individual contribution not independently verified" notice by default.

### FR-CAND-06 — Project evidence
- Within a project, a candidate can attach evidence items: uploaded document (PDF, max 10MB), external URL (screenshot required if URL may change), video demonstration link, written technical explanation.
- Each evidence item requires: evidence type, description, the candidate's specific contribution to this piece of evidence.

### FR-CAND-07 — Profile visibility
- A candidate can set profile visibility: Public / Visible to applied employers only / Private.
- Private profiles are not discoverable by employer search.

### FR-CAND-08 — Profile completeness
- The platform calculates a completeness percentage (skills, education, at least one project with evidence, bio).
- Completeness percentage is visible to the candidate only, not published to employers as a score.

---

## Module 3: Employer Organisation and Jobs

### FR-EMP-01 — Organisation creation
- An employer user can create an organisation with: name, website, description, size range, industry, headquarters location.
- One employer user account can belong to one organisation in MVP (multi-org is `DEFERRED`).

### FR-EMP-02 — Organisation membership
- An employer can invite other users to join their organisation by email.
- Invited users must accept the invitation before gaining access.
- Roles within an organisation: Owner, Admin, Member.
- Only Owners and Admins can post or manage jobs.
- Only Owners can manage organisation membership.

### FR-EMP-03 — Job creation
- An employer can create a job with: title, description, employment type (full-time / internship / contract), location (city, country, remote options), salary range (optional), application deadline (optional), required skills, preferred skills, experience expectation (narrative), explicit evaluation criteria.
- Jobs are created in `DRAFT` state and are not visible to candidates until published.

### FR-EMP-04 — Job requirements
- Within a job, an employer can define structured requirements: requirement text, importance (Required / Preferred), evidence type hint (what kind of evidence would demonstrate this).
- Requirements form the basis of evidence-to-requirement mapping.

### FR-EMP-05 — Job lifecycle
- States: `DRAFT` -> `PUBLISHED` -> `CLOSED` -> `ARCHIVED`.
- A published job is discoverable by candidates.
- Closing a job stops new applications but existing applications remain reviewable.
- Archiving removes from all active views but preserves data.

### FR-EMP-06 — Pipeline management
- Each job has a default application pipeline: Applied -> Screening -> Interview -> Offer -> Hired / Rejected.
- Employers can define custom pipeline stages per job (`PROPOSED` — validate whether this adds friction in MVP).

---

## Module 4: Applications

### FR-APP-01 — Application submission
- A candidate can apply to a published job.
- A candidate can apply to the same job only once (database constraint).
- Application includes: cover note (optional, max 1000 characters).
- The platform captures which version of the candidate's profile was current at application time (`PROPOSED` — profile snapshots may be technically complex; evaluate in Milestone 3).

### FR-APP-02 — Application state machine
Valid transitions (enforced by server, not only frontend):

```
Applied --> Screening       (employer action)
Applied --> Rejected        (employer action)
Screening --> Interview     (employer action)
Screening --> Rejected      (employer action)
Interview --> Offer         (employer action)
Interview --> Rejected      (employer action)
Offer --> Hired             (employer action)
Offer --> Rejected          (employer action, or candidate declines)
Rejected --> Screening      (requires explicit reopening action with logged reason)
```

Invalid transitions are rejected by the server with a 409 Conflict response.

### FR-APP-03 — Application status visibility
- Candidates can see the current stage of their application (stage name only; evaluation notes are internal).
- Candidates are not shown internal employer notes.

### FR-APP-04 — Evidence-to-requirement mapping view
- When an employer reviews an application, the system presents:
  - Each job requirement.
  - Candidate evidence items that are relevant (by skill tag or candidate-linked evidence).
  - Evidence source (project name, evidence type).
  - Relevance explanation (deterministic rule or AI-assisted, clearly labelled).
  - Missing evidence: requirements for which no evidence was found.
  - Self-reported vs. independently verifiable status for each evidence item.

### FR-APP-05 — Employer evaluation notes
- Employers can record evaluation notes per application.
- Notes are visible to organisation members with at least Member role.
- Notes are not visible to candidates.
- Notes are stored with author and timestamp.

---

## Module 5: Search and Discovery

### FR-SRCH-01 — Job search
- Candidates can search jobs by: keyword, required skills (multi-select), employment type, location, remote options.
- Results are paginated (max 20 per page).
- Results can be sorted by: most recent, relevance to candidate's skills (`ASSUMPTION` — validate usefulness).

### FR-SRCH-02 — Candidate search (employer)
- Employers can search candidates who have set profile visibility to Public.
- Search filters: skills (multi-select), location, experience level.
- Results are paginated.
- Candidate search must not expose private candidate profiles.

---

## Module 6: Administration

### FR-ADMIN-01 — Content reporting
- Any user can report a job listing or candidate profile for: false information, abusive content, impersonation.
- Reports are queued for administrator review.

### FR-ADMIN-02 — Account restriction
- Administrators can restrict an account: warning, temporary suspension, permanent ban.
- All restriction actions are logged in the audit event table with: action type, affected account, administrator ID, reason, timestamp.

### FR-ADMIN-03 — Audit events
- Sensitive platform actions generate immutable audit event records.
- Audit events include: authentication failures above threshold, account restrictions, administrative data access, job publish/archive, application state changes.

---

## 7. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft |

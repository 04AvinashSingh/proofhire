# Personas and User Journeys

> All personas are `ASSUMPTION` — composites based on general knowledge of the Indian software engineering job market.
> They must be validated and refined through the discovery interviews defined in `discovery-and-validation-plan.md`.

---

## 1. Candidate Personas

### Persona C1 — The Recent Graduate

**Name:** Arjun (composite)  
**Age:** 22  
**Background:** B.Tech Computer Science, tier-2 engineering college, Pune. Strong academic record. One internship at a mid-size startup. Several personal projects on GitHub — a React todo app, a Node.js REST API, a small ML model from a Kaggle competition.

**Goals:**
- Get his first full-time software engineering role.
- Differentiate himself from hundreds of other B.Tech graduates applying to the same roles.
- Prove that his self-taught skills are as strong as those of candidates from tier-1 colleges.

**Frustrations:**
- Résumé screeners filter him out based on college name before seeing his work.
- His GitHub is hard to explain — the projects exist but reviewers don't read the code.
- He doesn't know how to describe his contribution to team projects without sounding dishonest.
- He applies to 50+ roles and gets no response on 45 of them.

**Behaviours:**
- Spends hours on LinkedIn and Naukri.
- Pushes projects to GitHub but doesn't document them well.
- Prepares for DSA interviews on LeetCode obsessively, neglecting project presentation.

**What ProofHire could do for Arjun:**
- Give him a structured way to document what he built, why, and what decisions he made.
- Show his evidence against specific job requirements — so if a role needs "REST API design", his evidence is surfaced immediately.
- Distinguish "I built this with a team" from "I personally designed and implemented this component."

> Status: `ASSUMPTION` — needs validation.

---

### Persona C2 — The Career Switcher

**Name:** Priya (composite)  
**Age:** 26  
**Background:** Commerce graduate who taught herself web development over 18 months. Completed a paid full-stack bootcamp. Built two freelance client websites. Has no formal CS degree.

**Goals:**
- Land a junior frontend or full-stack role.
- Convince employers that her portfolio work is real and her skills are production-relevant.
- Overcome the "no CS degree" objection.

**Frustrations:**
- Most job applications ask for a degree she doesn't have.
- Her freelance work is hard to verify — she can't share client code.
- She has strong practical skills but no pedigree signals.

**What ProofHire could do for Priya:**
- Provide a structured mechanism to explain freelance contributions with client permission for screenshots and descriptions.
- Let her attach deployment links, recorded demonstrations, or technical write-ups.
- Help employers evaluate her evidence without defaulting to degree gatekeeping.

> Status: `ASSUMPTION` — needs validation.

---

## 2. Employer Personas

### Persona E1 — The Startup Engineering Manager

**Name:** Rahul (composite)  
**Age:** 32  
**Background:** Engineering Manager at a 40-person Series A startup in Bengaluru. Needs to hire 2 junior engineers. Has a small engineering team; no dedicated recruiter. Hires directly.

**Goals:**
- Hire a junior who can contribute to production within 2–3 months.
- Spend less time on unqualified applications.
- Maintain fairness across a diverse applicant pool.

**Frustrations:**
- Gets 200+ applications on LinkedIn and cannot review them all.
- GitHub profiles are superficial — many have only tutorial projects.
- Technical screens are expensive; he needs better pre-screen signals.
- Evaluation criteria vary across his team members, causing inconsistent outcomes.

**What ProofHire could do for Rahul:**
- Show each candidate's evidence mapped against his specific requirements (e.g., "React with hooks", "REST API design and testing").
- Surface missing evidence clearly: "This candidate has no evidence for backend API design."
- Reduce pre-screen call volume by improving asynchronous signal quality.

> Status: `ASSUMPTION` — needs validation.

---

### Persona E2 — The Technical Recruiter

**Name:** Meena (composite)  
**Age:** 29  
**Background:** Technical recruiter at a mid-size product company. Sources candidates and does first-round screening. Does not write code herself but can evaluate portfolios with a structured checklist.

**Goals:**
- Source candidates who will pass technical review.
- Reduce time-to-hire.
- Build a trusted pipeline of early-career talent.

**Frustrations:**
- Screening junior candidates without strong technical judgment is error-prone.
- Job descriptions from engineering managers are often vague ("3 years experience with React").
- She lacks a structured way to explain to a manager why she selected or rejected a candidate.

**What ProofHire could do for Meena:**
- Give her a structured view of evidence per requirement without requiring her to evaluate code.
- Provide clear "missing evidence" signals so she can ask candidates targeted follow-up questions.
- Help her justify candidate selection to the engineering manager with reference to specific evidence.

> Status: `ASSUMPTION` — needs validation.

---

## 3. Administrator Persona

### Persona A1 — The Platform Administrator

**Name:** ProofHire Ops team  
**Background:** Internal team member responsible for platform integrity.

**Goals:**
- Detect and handle abuse (fake evidence, impersonation, inappropriate content).
- Manage account restrictions with auditable records.
- Monitor platform health without accessing private candidate information unnecessarily.

**What ProofHire must provide:**
- A moderation queue for reported content.
- Audit logs for administrative actions (who did what, when, and why).
- Account restriction tools with appropriate access controls.
- Privacy-conscious dashboards (aggregate metrics, not individual browsing of candidate data).

---

## 4. User Journeys

### Journey J1 — Candidate: First Application

```
[Registration] -> [Profile creation] -> [Skills and education entry] ->
[Project creation] -> [Evidence attachment] -> [Contribution explanation] ->
[Job search and discovery] -> [Job detail view and requirement review] ->
[Application submission] -> [Application status tracking]
```

**Key decision points:**
- Does the candidate understand what "evidence" means on this platform vs. a standard résumé?
- Does the project form make it easy to separate personal contribution from team work?
- Is the evidence-to-requirement mapping visible to the candidate before they apply?

**Potential failure points:**
- Candidate doesn't have strong evidence for a required skill — does the platform explain what would constitute good evidence?
- Candidate attaches a GitHub URL but hasn't explained their specific contribution — platform should prompt for this.

---

### Journey J2 — Employer: Reviewing an Application

```
[Organisation setup] -> [Job creation] -> [Requirement definition] ->
[Job publish] -> [Application received notification] -> [Application list view] ->
[Candidate profile review] -> [Evidence-to-requirement review] ->
[Internal notes and evaluation] -> [Pipeline stage update] -> [Candidate notification]
```

**Key decision points:**
- Are job requirements expressed in a way that maps cleanly to candidate evidence?
- Does the evidence-to-requirement view surface "missing evidence" clearly?
- Can multiple team members view the same application without overwriting each other's notes?

**Potential failure points:**
- Employer defines vague requirements ("Good communication skills") that cannot be mapped to technical evidence.
- Evidence is provided but is entirely self-reported with no external verification — employer may distrust it.

---

### Journey J3 — Candidate: Post-Rejection Feedback

> Status: `DEFERRED` — post-rejection feedback feature is out of MVP scope. Documenting the journey for future reference.

```
[Application rejected] -> [Rejection notification] -> 
[Platform feedback summary: which requirements had insufficient evidence] ->
[Candidate updates profile and evidence] -> [Reapplies elsewhere]
```

---

## 5. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft — all personas marked ASSUMPTION |

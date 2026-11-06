# Discovery and Validation Plan

> This plan is `PROPOSED`. It must be approved before interviews begin.
> All statistics cited (e.g., sample sizes) are standard qualitative research norms, not statistically significant targets.

---

## 1. Objectives

1. Validate or invalidate H1 (candidate communication gap), H2 (employer evaluation inefficiency), H3 (evidence quality gap).
2. Identify the actual pain points candidates and employers experience — not the ones we assumed.
3. Determine whether a structured evidence platform would be adopted, and under what conditions.
4. Surface regulatory, ethical, or cultural constraints specific to the Indian hiring market.

---

## 2. Research Questions

### Candidate research questions
- How do you currently present your skills and projects to employers?
- What is most frustrating about the current process?
- Have you been rejected from a job where you felt you had the skills but couldn't demonstrate them?
- How do employers currently evaluate your GitHub or portfolio work?
- Would you invest time in structured evidence documentation if it improved your outcomes? What would make you stop?

### Employer research questions
- How many applications do you typically receive for a junior role? How long do you spend on each?
- What makes a junior candidate stand out positively? What is an immediate disqualifier?
- How do you evaluate project work from a candidate's GitHub or portfolio?
- How consistent is your evaluation process across different interviewers?
- What would make you trust a hiring platform's evidence more than a résumé?
- What price point would make a structured evidence platform worth trying?

---

## 3. Interview Plan

### Candidate interviews

| Parameter | Value |
|---|---|
| Target sample | 12–15 candidates |
| Segment | Software engineering graduates or developers with 0–2 years experience |
| Geography | India (primary); 1–2 international for comparison |
| Channels | Engineering colleges, developer communities (Discord, LinkedIn, Reddit r/developersIndia) |
| Format | 30-minute video call, semi-structured |
| Incentive | None initially; small Amazon voucher if needed |

### Employer interviews

| Parameter | Value |
|---|---|
| Target sample | 8–10 hiring stakeholders |
| Segment | Startup founders, engineering managers, technical recruiters |
| Geography | India (primary) |
| Channels | LinkedIn outreach, founder communities, personal networks |
| Format | 30-minute video call, semi-structured |
| Incentive | Report of aggregated findings |

---

## 4. Interview Scripts

### 4.1 Candidate Script (Draft)

```
Introduction (2 min):
"Hi, I'm [name] working on ProofHire, a project exploring hiring for junior developers. 
This is a research call — there's nothing to sell and no right answers. 
I'll take notes but I won't attribute anything to you by name. Is it okay if I record this call?"

Warm-up (3 min):
- "What are you working on these days?"
- "How long have you been applying for software roles?"

Current process (10 min):
- "Walk me through the last time you applied for a job. What did you submit?"
- "How did you decide what to include in your résumé or portfolio?"
- "Have you had an employer look at your GitHub? What happened?"
- "What is the most frustrating part of proving your skills to an employer?"

Evidence and differentiation (10 min):
- "If you worked on a team project, how do you explain what you personally did?"
- "Have you ever been rejected from a role where you felt you had the skills? What do you think went wrong?"
- "If you could show an employer exactly what you can do, what would that look like?"

Solution exploration — do NOT pitch yet (5 min):
- "What tools or approaches have you tried to stand out?"
- "If a platform let you document exactly what you built and why, and showed that to employers — would you use it? What would make you stop using it?"

Close (2 min):
- "Is there anything I should have asked that I didn't?"
- "Can I follow up with you later in this research?"
```

### 4.2 Employer Script (Draft)

```
Introduction (2 min):
[Same consent and recording intro as above.]

Warm-up (3 min):
- "What kind of role are you typically hiring for?"
- "How many junior hires have you made in the last year?"

Current process (10 min):
- "Walk me through your typical process for reviewing a junior application."
- "How long does it take from application to first screen call?"
- "How do you evaluate a candidate's GitHub or portfolio?"
- "How consistent is your evaluation across different people on your team?"

Pain points (10 min):
- "What is the most frustrating part of hiring junior engineers?"
- "Have you ever hired someone who looked great on paper but didn't work out? What went wrong?"
- "Have you ever rejected someone and later thought you were wrong?"

Solution exploration (5 min):
- "If you could see exactly which parts of a job requirement a candidate has evidence for — and which parts are missing — would that help?"
- "What would you need to trust that evidence? What would make you distrust it?"
- "What would you pay for a tool like this, per hire or per month?"

Close (2 min):
- "Is there anything I should have asked that I didn't?"
- "Can I follow up with a prototype to get your reaction?"
```

---

## 5. Findings Template

For each interview, record:

```markdown
## Interview [ID] — [Role: Candidate / Employer] — [Date]

**Participant:** [Segment description only — no names in repo]
**Duration:** [minutes]
**Interviewer:** [initials]

### Key quotes
- "[Direct quote]"

### Pain points surfaced
- [Pain point]

### Behaviours observed (what they actually do, not what they say they do)
- [Behaviour]

### H1/H2/H3 signals
- H1 (candidate communication gap): [Supports / Contradicts / Neutral] — [evidence]
- H2 (employer evaluation inefficiency): [Supports / Contradicts / Neutral] — [evidence]
- H3 (evidence quality gap): [Supports / Contradicts / Neutral] — [evidence]

### Surprises or contradictions
- [Unexpected finding]

### Follow-up required
- [Action item]
```

---

## 6. Assumption Register Update Process

After each interview batch (every 3–4 interviews):
1. Review the assumption register in `assumptions-and-risks.md`.
2. Update each assumption's status: `ASSUMPTION` / `SUPPORTED` / `CONTRADICTED` / `NUANCED`.
3. Note the interview IDs providing evidence.
4. Flag any assumptions that have been strongly contradicted — escalate for a product direction review.

---

## 7. Go / No-Go Criteria

Before committing to a full-featured MVP build, the following criteria must be assessed:

| Criterion | Go threshold | No-go signal |
|---|---|---|
| H1 validation | At least 8 of 15 candidates describe a concrete frustration with demonstrating skills beyond résumé | Fewer than 5 report this as a meaningful pain |
| H2 validation | At least 6 of 10 employers describe inconsistency or inefficiency in junior candidate evaluation | Employers are broadly satisfied with existing tools |
| Willingness to use | At least 6 employers express clear interest in a structured evidence interface | Employers are indifferent or negative |
| Willingness to pay | At least 4 employers indicate a price point above operational cost | No employer sees sufficient value to pay |
| No fatal regulatory blocker | DPDP review confirms MVP data model is compliant without major rearchitecting | Compliance requires features that exceed MVP scope |

---

## 8. Timeline (Proposed)

| Week | Activity |
|---|---|
| 1 | Recruit participants; finalise scripts |
| 2–3 | Conduct candidate interviews (12–15) |
| 2–3 | Conduct employer interviews (8–10) |
| 4 | Synthesise findings; update assumption register |
| 4 | Go/no-go review; revise PRD if needed |
| 5+ | Proceed with engineering foundation if go criteria met |

> Status: `PROPOSED` — timeline assumes the team has capacity for interviews alongside early engineering work.

---

## 9. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft |

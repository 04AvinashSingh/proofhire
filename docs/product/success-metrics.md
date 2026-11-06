# Success Metrics

> Status: `PROPOSED` — metrics must be instrumented before they can be measured.
> All targets are `ASSUMPTION` — baselines must be established after initial launch.
> Do not report these metrics as achieved until they are actually measured.

---

## 1. Product Validation Metrics (Discovery Phase)

These metrics inform the go/no-go decision for the full MVP build.

| Metric | Target | Measurement method |
|---|---|---|
| Candidate interviews completed | 12–15 | Interview log in `docs/product/discovery-and-validation-plan.md` |
| Employer interviews completed | 8–10 | Interview log |
| H1 support rate (candidate communication pain) | >= 8 of 15 candidates confirm | Findings template |
| H2 support rate (employer evaluation inefficiency) | >= 6 of 10 employers confirm | Findings template |
| Employer willingness to use | >= 6 of 10 express clear intent | Findings template |
| Employer willingness to pay | >= 4 of 10 state a viable price point | Findings template |

---

## 2. Engagement Metrics (Post-Launch)

### 2.1 Candidate Engagement

| Metric | Definition | Initial target (ASSUMPTION) |
|---|---|---|
| Registration completion rate | Users who complete verification / registered users | > 60% |
| Profile completion rate | Users with at least 1 project with evidence / registered candidates | > 40% |
| Evidence attachment rate | Projects with at least 1 evidence item / total projects | > 50% |
| Application submission rate | Candidates who apply to at least 1 job / active candidates in 30 days | > 30% |
| Return visit rate (7-day) | Candidates who return within 7 days of last visit | > 25% |

### 2.2 Employer Engagement

| Metric | Definition | Initial target (ASSUMPTION) |
|---|---|---|
| Job creation completion rate | Jobs published / jobs created (including drafts) | > 70% |
| Structured requirement adoption | Jobs with at least 3 requirements / published jobs | > 80% |
| Evidence mapping view rate | Applications where employer opened evidence-mapping view / reviewed applications | > 60% |
| Pipeline progression rate | Applications moved past "Applied" stage / total applications | > 40% |
| Return usage rate | Employers who post a second job within 90 days of first | > 30% |

---

## 3. Core Differentiator Metrics

These measure whether the evidence-mapping feature is actually used and valued.

| Metric | Definition | Target |
|---|---|---|
| Evidence mapping view rate | See above | > 60% of reviewed applications |
| "Missing evidence" flag utility | Employers who view a "No evidence found" flag and take a follow-up action | Baseline first; optimise after |
| Employer evaluation note rate | Applications with at least one employer note / reviewed applications | > 40% |
| Time to first employer action | Median time from application submission to first pipeline stage change | Baseline and track |

---

## 4. Quality and Safety Metrics

| Metric | Definition | Target |
|---|---|---|
| API error rate | 5xx responses / total responses | < 0.5% |
| Authentication failure rate | Failed login attempts / total login attempts | Track; alert on spikes (potential brute force) |
| Content report resolution time | Median time from report submission to resolution | < 48 hours |
| Audit event coverage | Sensitive actions with audit event / total sensitive actions | 100% |
| Test pass rate (CI) | Passing CI runs / total CI runs on main branch | > 95% |

---

## 5. Technical Performance Metrics

| Metric | Target | When to measure |
|---|---|---|
| API p95 response time (simple queries) | < 300ms | Load test with realistic data volume |
| API p95 response time (evidence mapping) | < 800ms | Load test |
| Frontend LCP | < 3s on simulated 4G | Lighthouse CI |
| Database query time (job listing with filters) | p95 < 100ms | EXPLAIN ANALYZE on representative dataset |
| AI service response time | p95 < 5s | Measured in staging with real provider |

> All performance targets are `ASSUMPTION` until measured.

---

## 6. What We Explicitly Do Not Measure

The following metrics are explicitly excluded because they would incentivise the wrong behaviours:

| Excluded metric | Reason |
|---|---|
| Number of jobs posted | Would incentivise volume over quality |
| Number of applications submitted | Would incentivise spray-and-pray applications |
| AI match score as a quality proxy | Would create false confidence in automated matching |
| "Top candidate" rankings | Would introduce bias and gamification |
| Résumé view count as engagement | Not the product's value proposition |

---

## 7. Metric Instrumentation Plan

| Phase | Metrics available | Method |
|---|---|---|
| Milestone 0 (current) | None — product not built | — |
| Milestone 1–2 | Registration events, login events, error rates | Structured logs + event table |
| Milestone 3 | Profile completion, job creation, application submission | Server-side event tracking |
| Milestone 4 | Evidence mapping view rate, employer note rate, pipeline progression | Server-side event tracking |
| Milestone 5+ | AI feature usage, AI error rates, AI evaluation scores | AI service logs + evaluation dataset |
| Post-MVP | Engagement funnels, retention cohorts, conversion | Analytics pipeline (to be defined) |

---

## 8. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft — all targets classified ASSUMPTION |

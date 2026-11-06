# Competitor Analysis

> **Methodology note:** This analysis is based on publicly available information as of October 2026.
> No proprietary data, insider knowledge, or user interviews were used.
> All characterisations of competitor features are based on public documentation and public user reviews.
> We have not conducted primary research with users of these platforms.
> All strategic inferences are `ASSUMPTION`.

---

## 1. Competitive Landscape Overview

ProofHire operates at the intersection of three categories:
1. **Job boards** — where candidates find and apply to jobs.
2. **Hiring/ATS platforms** — where employers manage applicants and pipelines.
3. **Skill assessment platforms** — where candidates complete tests and employers receive scores.

ProofHire's proposed differentiation — structured evidence-to-requirement mapping — does not map cleanly to any of these three categories.

---

## 2. Direct Competitors (India-focused)

### 2.1 Naukri.com (Info Edge)

| Dimension | Assessment |
|---|---|
| Market position | Dominant Indian job board; very large candidate and employer database |
| Target segment | All experience levels; not early-career specific |
| Candidate experience | Résumé upload, profile builder, self-reported skills |
| Employer experience | Resume database search, job posting, basic filtering |
| Evidence and verification | Limited — "verified" badge for some certifications; primarily self-reported |
| Early-career focus | Not specialised; junior roles are a subset |
| Differentiation vs. ProofHire | Scale and network; no structured evidence-to-requirement mapping |

**Strategic inference (ASSUMPTION):** Naukri's strength is volume and network. A new entrant cannot compete on breadth; must compete on evidence quality and hiring relevance for a specific segment.

---

### 2.2 LinkedIn (Microsoft)

| Dimension | Assessment |
|---|---|
| Market position | Global professional network; dominant for active and passive hiring |
| Target segment | All experience levels, all geographies |
| Candidate experience | Profile, skills endorsements, portfolio links, "Open to Work" |
| Employer experience | InMail, recruiter search, LinkedIn Easy Apply, LinkedIn Talent Insights |
| Evidence and verification | Skills assessments (self-selected, multiple choice), endorsements (social, not independent), certifications |
| Early-career focus | Has student/recent-grad features; not the core focus |
| Differentiation vs. ProofHire | No structured evidence-per-job-requirement mapping; skills are generic, not job-specific |

**Strategic inference (ASSUMPTION):** LinkedIn's skill assessments are surface-level multiple-choice tests, not contextual evidence. ProofHire's per-requirement evidence mapping is structurally different if the hypothesis is correct.

---

### 2.3 Internshala

| Dimension | Assessment |
|---|---|
| Market position | Leading Indian platform for internships and entry-level jobs |
| Target segment | Students and recent graduates; 0–2 years experience — close overlap |
| Candidate experience | Profile, résumé, certifications through Internshala Trainings |
| Employer experience | Job posting, application review, basic screening |
| Evidence and verification | Certificates from Internshala courses; no general project evidence mapping |
| Early-career focus | Very strong; dominant in the internship segment |
| Differentiation vs. ProofHire | High volume, strong brand; no structured evidence-to-requirement mapping for external projects |

**Strategic inference (ASSUMPTION):** Internshala is the closest direct competitor by segment. Its strength is breadth and internship-to-job funnel. ProofHire's differentiation must be evidence quality, not volume.

---

## 3. Adjacent Competitors (Assessment-focused)

### 3.1 HackerRank / Codility / iMocha

| Dimension | Assessment |
|---|---|
| Model | Technical assessment tests administered by employers to candidates |
| Candidate experience | Solve DSA or coding problems under timed, proctored conditions |
| Employer experience | Receive a score; use score for screening |
| Evidence quality | Standardised test performance; does not assess project work or real-world design |
| Limitations | Gaming (practice is specific to platform format); does not assess practical engineering skills well; controversial in early-career hiring |
| Differentiation vs. ProofHire | ProofHire captures project evidence, not test scores; avoids proctoring and high-stakes timed assessments |

---

### 3.2 GitHub (Microsoft) / GitLab

| Dimension | Assessment |
|---|---|
| Model | Public repository hosting; often used by employers as a portfolio |
| Candidate experience | Public profile, contribution graph, pinned repositories |
| Employer experience | Browse code manually; no structured evaluation support |
| Evidence quality | Raw — no guidance on what constitutes good evidence; contribution graph gameable |
| Limitations | Does not separate individual contribution from team work; no requirement mapping; requires employer to know how to evaluate code |
| Differentiation vs. ProofHire | ProofHire adds structure (what was built, personal contribution, which requirement it addresses) on top of what GitHub already provides |

---

### 3.3 Wellfound (formerly AngelList Talent)

| Dimension | Assessment |
|---|---|
| Market position | Strong in startup hiring, especially in the US |
| Target segment | Startup roles; increasing global reach |
| Candidate experience | Profile with startup-friendly design; salary transparency |
| Employer experience | Direct outreach, signal matching |
| Evidence quality | Self-reported; no structured evidence mapping |
| India presence | Limited but growing |
| Differentiation vs. ProofHire | More focused on job matching than evidence quality; different segment fit |

---

## 4. International Comparison

| Country | Dominant platform | Early-career hiring norms | ProofHire relevance |
|---|---|---|---|
| India | Naukri, LinkedIn, Internshala | Résumé + technical screen; degree-heavy | Primary market |
| UK | LinkedIn, Gradcracker, Milkround | Graduate schemes with structured assessment centres | `DEFERRED` — different hiring structure |
| US | LinkedIn, Handshake (campus), Indeed | OCI/campus recruiting with technical interviews | `DEFERRED` — very different market structure |
| Southeast Asia | JobStreet, LinkedIn | Résumé-driven; growing tech-specific needs | Possible secondary market — not in MVP |

---

## 5. Feature Comparison Matrix

| Feature | ProofHire (proposed) | Naukri | LinkedIn | Internshala | HackerRank |
|---|---|---|---|---|---|
| Job board | Yes | Yes | Yes | Yes | Limited |
| Early-career focus | Yes | Partial | Partial | Yes | Yes |
| Per-requirement evidence mapping | Yes | No | No | No | No |
| Self-reported evidence with clear labelling | Yes | Implicit | Implicit | Implicit | N/A |
| Independent verification | No (MVP) | Limited | Limited | Limited | Yes (test scores) |
| Evidence provenance | Yes | No | No | No | No |
| Missing evidence identification | Yes | No | No | No | Partial |
| AI evidence summarisation | Planned | No | Limited | No | No |
| Employer pipeline management | Yes | Basic | Yes | Basic | Yes |
| Bias controls | Documented | Unknown | Partial | Unknown | Partial |
| India market presence | Planned | Very strong | Strong | Very strong | Medium |

---

## 6. Competitive Positioning

**ProofHire is not positioned as:**
- A general job board (competing with Naukri on volume is not viable at launch).
- A coding assessment platform (competing with HackerRank on standardised tests is not the goal).
- A professional network (competing with LinkedIn's network effects is not viable).

**ProofHire is positioned as:**
- A hiring workflow tool that structures the evidence review process for early-career software engineers.
- A trust layer that distinguishes what candidates claim from what they can demonstrate.
- A transparency tool for both candidates (what evidence do I need?) and employers (what evidence is actually present?).

> This positioning is `PROPOSED` and must be tested against actual user feedback.

---

## 7. Limitations of This Analysis

- We have not tested competitor products as active candidates or employers.
- Feature claims are based on public documentation; actual product behaviour may differ.
- Market share figures are not cited because reliable India-specific data for these segments was not independently verified.
- Competitor product evolution is continuous; this analysis will become stale quickly.

---

## 8. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft — all strategic inferences marked ASSUMPTION |

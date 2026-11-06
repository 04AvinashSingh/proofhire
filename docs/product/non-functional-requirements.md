# Non-Functional Requirements

> Status: `PROPOSED` unless marked `DECIDED`. These targets are initial estimates, not validated SLAs.
> They must be reviewed after discovery and before production launch.

---

## 1. Performance

| ID | Requirement | Target | Priority | Notes |
|---|---|---|---|---|
| NFR-PERF-01 | API response time — simple queries | p95 < 300ms | High | Reads with indexed lookups |
| NFR-PERF-02 | API response time — complex queries | p95 < 800ms | Medium | Evidence mapping, aggregations |
| NFR-PERF-03 | Frontend initial load (LCP) | < 3s on 4G (simulated) | High | Measure with Lighthouse |
| NFR-PERF-04 | Database query — job listing | p95 < 100ms with appropriate index | High | Verify with EXPLAIN ANALYZE |
| NFR-PERF-05 | AI service response | p95 < 5s; timeout at 10s | Medium | Fail gracefully if exceeded |
| NFR-PERF-06 | Concurrent users (MVP target) | 100 concurrent without degradation | Low | Scale assumption — validate before launch |

> All performance targets are `ASSUMPTION` until measured on representative hardware and realistic data.

---

## 2. Scalability

| ID | Requirement | Status |
|---|---|---|
| NFR-SCALE-01 | Core backend is a modular monolith — no premature service splitting | `DECIDED` |
| NFR-SCALE-02 | Horizontal scaling of the API service is possible (stateless request handling) | `PROPOSED` |
| NFR-SCALE-03 | Database is not the bottleneck for MVP workloads | `ASSUMPTION` — verify with load test |
| NFR-SCALE-04 | AI service is a separate Python process — scales independently | `DECIDED` |
| NFR-SCALE-05 | Read replicas are not required for MVP but architecture must not prevent adding them | `PROPOSED` |

---

## 3. Availability and Reliability

| ID | Requirement | Target | Notes |
|---|---|---|---|
| NFR-REL-01 | Core hiring workflow available without AI service | 100% — invariant | Degrade AI features; preserve everything else |
| NFR-REL-02 | Graceful shutdown | All in-flight requests complete before shutdown | Required for zero-downtime deploys |
| NFR-REL-03 | Health endpoint | `/health` returns 200 within 200ms | Used by Docker / orchestration |
| NFR-REL-04 | Readiness endpoint | `/ready` confirms DB connection before accepting traffic | Prevents traffic during startup |
| NFR-REL-05 | Database connection pooling | Pool configured; connections properly released | Prevent connection exhaustion |
| NFR-REL-06 | External HTTP call timeout | Max 10s; bounded retries with exponential backoff | No unbounded waits |
| NFR-REL-07 | Database backup | Automated daily backup; tested restore procedure | Required before production |

---

## 4. Security

| ID | Requirement | Status |
|---|---|---|
| NFR-SEC-01 | Passwords hashed with Argon2id | `DECIDED` |
| NFR-SEC-02 | Sessions in HttpOnly, Secure, SameSite=Strict cookies | `DECIDED` |
| NFR-SEC-03 | CSRF protection for cookie-based authenticated mutation endpoints | `DECIDED` |
| NFR-SEC-04 | All inputs validated server-side with Zod | `DECIDED` |
| NFR-SEC-05 | Object-level authorisation enforced on every API handler | `DECIDED` |
| NFR-SEC-06 | Rate limiting on authentication endpoints | `DECIDED` |
| NFR-SEC-07 | No secrets in source control | `DECIDED` — invariant |
| NFR-SEC-08 | Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) | `DECIDED` |
| NFR-SEC-09 | Dependency audit in CI (npm audit, pip-audit) | `DECIDED` |
| NFR-SEC-10 | SSRF protections for any user-supplied URL fetching | `DECIDED` |
| NFR-SEC-11 | Uploaded file validation (type checking, size limit, virus scanning if feasible) | `PROPOSED` — virus scanning may be deferred |
| NFR-SEC-12 | No sensitive data in logs (passwords, session tokens, API keys, PII beyond necessary IDs) | `DECIDED` — invariant |
| NFR-SEC-13 | AI provider API keys are server-side only, never exposed to clients | `DECIDED` |
| NFR-SEC-14 | Cross-tenant data isolation — employers cannot see other employers' private evaluations | `DECIDED` — invariant |

---

## 5. Privacy

| ID | Requirement | Status |
|---|---|---|
| NFR-PRIV-01 | Explicit, informed consent obtained at registration | `DECIDED` |
| NFR-PRIV-02 | Minimal data collection — only what is required for the stated purpose | `DECIDED` |
| NFR-PRIV-03 | Candidate data deletion mechanism (right to erasure, DPDP Act) | `DECIDED` |
| NFR-PRIV-04 | Data retention policy defined and enforced | `PROPOSED` — define before production |
| NFR-PRIV-05 | Candidate personal data not shared with AI providers without explicit consent or necessity | `PROPOSED` — review LLM provider data handling terms |
| NFR-PRIV-06 | Audit log for sensitive administrative access to candidate data | `DECIDED` |
| NFR-PRIV-07 | DPDP Act (India) compliance review required before production launch | `DECIDED` |

---

## 6. Accessibility

| ID | Requirement | Target | Status |
|---|---|---|---|
| NFR-A11Y-01 | Target compliance level | WCAG 2.1 AA | `PROPOSED` |
| NFR-A11Y-02 | Keyboard navigability for all interactive elements | All forms, buttons, dialogs | `DECIDED` |
| NFR-A11Y-03 | Screen reader compatibility for candidate profile and job listing pages | Core candidate and employer journeys | `PROPOSED` |
| NFR-A11Y-04 | Colour contrast ratio | Minimum 4.5:1 for normal text | `DECIDED` |
| NFR-A11Y-05 | Responsive design | Usable on 375px mobile and 1280px desktop | `DECIDED` |

---

## 7. Observability

| ID | Requirement | Status |
|---|---|---|
| NFR-OBS-01 | Structured JSON logging (not plain text) | `DECIDED` |
| NFR-OBS-02 | Request correlation IDs on all API requests | `DECIDED` |
| NFR-OBS-03 | Log levels: ERROR, WARN, INFO, DEBUG — configurable per environment | `DECIDED` |
| NFR-OBS-04 | No sensitive data in logs | `DECIDED` — invariant |
| NFR-OBS-05 | Application error reporting (structured, not just console.error) | `DECIDED` |
| NFR-OBS-06 | Health and readiness endpoints | `DECIDED` |
| NFR-OBS-07 | AI provider failure events logged with duration and error type | `DECIDED` |
| NFR-OBS-08 | Background job failures logged with job type, attempt count, and error | `PROPOSED` — if background jobs introduced |

---

## 8. Maintainability and Code Quality

| ID | Requirement | Status |
|---|---|---|
| NFR-MAINT-01 | TypeScript strict mode — no implicit any | `DECIDED` |
| NFR-MAINT-02 | ESLint and Prettier enforced in CI | `DECIDED` |
| NFR-MAINT-03 | No dead code or placeholder implementations marked as complete | `DECIDED` |
| NFR-MAINT-04 | Each module has clear boundaries and a single responsibility | `DECIDED` |
| NFR-MAINT-05 | All API endpoints have corresponding integration tests | `DECIDED` |
| NFR-MAINT-06 | Database migrations are reversible where practical | `PROPOSED` |
| NFR-MAINT-07 | OpenAPI spec is generated from or kept in sync with implementation | `DECIDED` |

---

## 9. Testability

| ID | Requirement | Status |
|---|---|---|
| NFR-TEST-01 | Unit tests for all business rules and algorithms | `DECIDED` |
| NFR-TEST-02 | Integration tests for database operations and API permissions | `DECIDED` |
| NFR-TEST-03 | Security regression tests for access-control boundaries | `DECIDED` |
| NFR-TEST-04 | E2E tests for critical candidate and employer journeys | `PROPOSED` — Playwright preferred |
| NFR-TEST-05 | Test commands documented and runnable from a clean checkout | `DECIDED` |
| NFR-TEST-06 | No test depends on external services without explicit mocking | `DECIDED` |
| NFR-TEST-07 | AI evaluation tests when AI features introduced | `PROPOSED` |

---

## 10. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft |

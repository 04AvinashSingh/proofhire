# Requirements Traceability Matrix

**Date:** 2026-10-21  
**Milestone:** 2 — Identity, Access, and Tenant Isolation  

---

| Requirement ID | Description | Source / ADR | Implementation Component | Test Verification | Status |
|---|---|---|---|---|---|
| **REQ-AUTH-01** | Argon2id password hashing | ADR-003 | `PasswordService.ts` (`@node-rs/argon2`) | `passwordService.test.ts` (4 tests) | ✅ VALIDATED |
| **REQ-AUTH-02** | Opaque session tokens with SHA-256 hash | ADR-004 | `SessionService.ts`, `sessions` table | `sessionService.test.ts` (4 tests) | ✅ VALIDATED |
| **REQ-AUTH-03** | HttpOnly, Secure, SameSite=Strict cookies | ADR-004 | `auth.ts` middleware (`setAuthCookies`) | `auth.test.ts` (cookie assertion) | ✅ VALIDATED |
| **REQ-AUTH-04** | Candidate self-registration | PRD §3.1 | `POST /api/v1/auth/register/candidate` | `auth.test.ts` | ✅ VALIDATED |
| **REQ-AUTH-05** | Employer organization registration | PRD §3.2 | `POST /api/v1/auth/register/employer` | `auth.test.ts` | ✅ VALIDATED |
| **REQ-AUTH-06** | User login and session termination | PRD §3.3 | `POST /api/v1/auth/login`, `POST /logout` | `auth.test.ts` | ✅ VALIDATED |
| **REQ-AUTH-07** | Account suspension enforcement | PRD §3.4 | `authService.login`, `sessionService` | `auth.test.ts` (suspended user check) | ✅ VALIDATED |
| **REQ-AUTH-08** | Role-Based Access Control (RBAC) | Authz Doc §2 | `requireRole` middleware | `organisations.test.ts` | ✅ VALIDATED |
| **REQ-AUTH-09** | Cross-tenant isolation | System Inv. | `OrganizationService.ts`, `organisations.ts` | `organisations.test.ts` (Org A vs Org B) | ✅ VALIDATED |
| **REQ-SEC-01** | Double-submit CSRF cookie protection | Authz Doc §3 | `requireCsrf` middleware | `organisations.test.ts` | ✅ VALIDATED |
| **REQ-SEC-02** | In-memory sliding window rate limiting | Authz Doc §4 | `rateLimiter.ts` | `rateLimiter.ts` | ✅ VALIDATED |
| **REQ-UI-01** | Client session context & login page | PRD §4.1 | `AuthContext.tsx`, `LoginPage.tsx` | `App.test.tsx` (4 tests) | ✅ VALIDATED |
| **REQ-UI-02** | Protected routes and role gates | PRD §4.2 | `ProtectedRoute.tsx`, `DashboardPage.tsx` | `App.test.tsx` | ✅ VALIDATED |

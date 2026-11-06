# Testing Strategy

---

## 1. Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  ← Few, slow, high-confidence critical paths
                    ├─────────────┤
                   │  API Contract │  ← OpenAPI schema validation
                  ├───────────────┤
                 │  Integration Tests │  ← DB, transactions, auth, permissions
                ├─────────────────────┤
               │      Unit Tests       │  ← Business rules, algorithms, utilities
              └───────────────────────┘
```

---

## 2. Test Types and Scope

### 2.1 Unit Tests

**Tool:** Vitest (API and web)  
**Location:** Co-located with source files as `*.test.ts` or in `__tests__/`  
**Run command:** `npm test` (from `apps/api` or `apps/web`)

**Scope:**
- Business rules (e.g., `isValidApplicationTransition`)
- Algorithm implementations (e.g., evidence matching, Jaccard score)
- Utility functions (e.g., token generation, sanitisation)
- React component rendering and user interactions (React Testing Library)

**Rules:**
- No real database connections.
- No real HTTP calls.
- All external dependencies are mocked.
- Tests must be deterministic and order-independent.

### 2.2 Integration Tests

**Tool:** Vitest + a real PostgreSQL test database  
**Location:** `apps/api/src/__tests__/integration/`  
**Run command:** `npm run test:integration` (requires `DATABASE_TEST_URL` to be set)

**Scope:**
- Database operations: CRUD, transactions, constraint enforcement.
- Migration correctness: run all migrations on a clean database.
- API endpoint tests: HTTP request → response with real DB.
- Authentication flows: login, session, logout, password reset.
- Authorisation boundaries: employer A cannot access employer B's data.
- Application state machine with concurrent requests.
- Duplicate prevention (unique constraints under concurrency).

**Rules:**
- Use a separate test database (`proofhire_test`).
- Each test suite resets the database to a known state using a transaction rollback or explicit truncation.
- Tests must not depend on execution order.
- Tests must not leave data in the database after completion.

### 2.3 API Contract Tests

**Tool:** OpenAPI schema validation middleware + Supertest  
**Scope:** Every API endpoint's response is validated against the OpenAPI spec.

This catches:
- Undocumented fields being added to responses.
- Required fields missing from responses.
- Incorrect status codes.

### 2.4 Security Regression Tests

**Location:** `apps/api/src/__tests__/security/`  
**Scope:**
- Unauthenticated access to authenticated endpoints returns 401.
- A candidate cannot access another candidate's private profile.
- An employer cannot access another organisation's applications or evaluation notes.
- A non-admin cannot access admin endpoints.
- Application state transitions that should fail (invalid transitions, wrong user type) return 409 or 403.

These tests are mandatory for every milestone touching authentication or authorisation.

### 2.5 End-to-End Tests

**Tool:** Playwright  
**Location:** `apps/web/e2e/`  
**Run command:** `npm run test:e2e` (requires all services running)

**Scope (critical paths only):**
- Candidate: Register → verify email → build profile → add project with evidence → search jobs → apply.
- Employer: Register → create organisation → create job with requirements → publish → review application → view evidence mapping → update pipeline stage.
- Admin: Log in → view reports → restrict an account.

**Rules:**
- E2E tests run against a local environment (Docker Compose).
- E2E tests use a seeded test dataset.
- E2E tests are not run on every commit — only on PRs to main and in nightly CI.

### 2.6 AI Evaluation Tests (Milestone 5)

**Tool:** Python pytest + a small versioned evaluation dataset  
**Scope:**
- Given evidence item E and requirement R, does the AI-generated relevance explanation reference actual evidence?
- Does the system return "Insufficient evidence" when evidence is absent?
- Does the system not invent qualifications not present in the evidence?

**Dataset format:** JSON file with test cases:
```json
{
  "id": "eval-001",
  "evidence_text": "...",
  "requirement_text": "...",
  "expected_result": "SUPPORTED | INSUFFICIENT | CONTRADICTED",
  "expected_citations": ["..."],
  "notes": "..."
}
```

### 2.7 Performance Tests (Milestone 6)

**Tool:** k6 or autocannon  
**Scope:**
- Job search with filters under simulated load.
- Evidence mapping computation time.
- Database query plans verified with `EXPLAIN ANALYZE`.

---

## 3. Test Data Strategy

### 3.1 Fixtures

- Define typed fixture factories in `apps/api/src/__tests__/factories/`.
- Each factory creates minimal valid objects; tests add only the fields they care about.
- Example: `createUser(overrides?)`, `createJob(overrides?)`, `createApplication(overrides?)`.

### 3.2 Test Database State

Integration tests use one of:
1. **Transaction rollback:** Wrap each test in a transaction; roll back after the test. Fast but does not test transactions themselves.
2. **Explicit truncation:** Truncate relevant tables before each test suite. Slower but tests actual transaction behaviour.

The choice is documented per test file.

### 3.3 No Production Data in Tests

- No real user data in test fixtures.
- No real API keys in tests — use environment stubs.
- Seed data uses obviously fake information (e.g., `test@proofhire.dev`, `Test Organisation Ltd`).

---

## 4. CI Test Execution Order

1. Install dependencies.
2. Typecheck (TypeScript compilation with no emit).
3. Lint (ESLint + Prettier).
4. Unit tests (no database required).
5. Start test database (Docker Compose).
6. Run migrations on test database.
7. Integration tests.
8. API contract tests.
9. Security regression tests.
10. Build (verify compilation).
11. (Optional, scheduled) E2E tests.

---

## 5. Test Coverage Policy

- We do not enforce a minimum percentage coverage target. Coverage percentages do not measure test quality.
- What matters: every business rule, every access-control boundary, and every state transition must have at least one targeted test.
- Untested critical paths must be explicitly documented as known gaps.

---

## 6. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft |

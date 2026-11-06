# Development Workflow

**Date:** 2026-10-21  
**Milestone:** 1 — Engineering Foundation  

---

## 1. Monorepo Organization

ProofHire uses standard `npm` workspaces.

```
proofhire/
├── apps/
│   ├── api/                   # Express Core API
│   ├── web/                   # Vite React SPA
│   └── ai-service/            # FastAPI Python service (Milestone 5)
├── packages/
│   └── shared-contracts/      # Types, Zod Schemas, API Envelopes
├── infrastructure/
│   └── docker/                # Dockerfiles and initialization scripts
└── docs/                      # Architectural decisions, PRDs, runbooks
```

---

## 2. Engineering Invariants

1. **Strict TypeScript:** No `any` without explicit documented exception. `strict: true` and `noImplicitAny: true` are enforced on all packages.
2. **Contract-First:** Any API payload or route schema modification MUST start in `packages/shared-contracts` before updating API or Web implementations.
3. **Fail-Fast Environment Validation:** All environment variables are validated at bootstrap using Zod. The process exits with code 1 and descriptive diagnostics if variables are missing.
4. **Structured Error Handling:** Domain code must throw `AppError` subclasses. Unhandled errors are caught by `errorHandler` and masked in production.
5. **No Fabricated Tests:** Every test suite must be executed with Vitest. Code changes require passing automated tests before milestone sign-off.

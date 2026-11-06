# ProofHire

**Evidence-based hiring for early-career software developers.**

ProofHire helps candidates demonstrate their practical engineering skills through structured project evidence, and helps employers evaluate candidates against explicit job requirements — not just keyword-matched résumés.

> **Project status:** Milestone 0 — Discovery and Foundation.
> This product is in early development. All product hypotheses are unvalidated.
> See `docs/product/assumptions-and-risks.md`.

---

## What is ProofHire?

ProofHire is not a general job board. Its central concept is **evidence-to-requirement mapping**:

1. A candidate claims a skill.
2. The candidate provides project evidence for that claim.
3. An employer defines what a job requires.
4. The platform presents relevant evidence against each requirement — and clearly identifies what is missing.
5. The employer makes the hiring decision. The platform never does.

All candidate-supplied evidence is labelled as **self-reported** unless independently verified. ProofHire does not fabricate qualifications, invent verifications, or make automated hiring decisions.

---

## Repository Structure

```
proofhire/
  apps/
    web/            React + TypeScript + Vite frontend
    api/            Node.js + TypeScript + Express core backend
    ai-service/     Python + FastAPI AI service
  packages/
    shared-contracts/   Shared TypeScript types and API contracts
  infrastructure/
    docker/         Dockerfiles for each service
    deployment/     Deployment configuration (non-production)
  docs/
    product/        Product discovery, requirements, personas
    architecture/   System design, data model, ADRs
    engineering/    Testing strategy, runbook, glossary
    security/       Threat model, security checklist
    operations/     Runbook, backup, observability
  scripts/          Utility scripts (seed data, migrations, etc.)
  docker-compose.yml
  .env.example
  README.md
  CONTRIBUTING.md
  SECURITY.md
  AGENTS.md
```

---

## Prerequisites

| Tool | Required version | Purpose |
|---|---|---|
| Node.js | 20 LTS or later | API and web app |
| npm | 10 or later | Package management |
| Python | 3.11 or later | AI service |
| Docker | 24 or later | Local services |
| Docker Compose | v2 plugin | Local orchestration |
| PostgreSQL client (psql) | 15 or later | Manual DB inspection (optional) |

---

## Local Development Setup

> **Status:** Milestone 1 in progress. These instructions will be updated when the setup is verified.

### 1. Clone and configure environment

```bash
# Clone the repository
git clone <repository-url>
cd proofhire

# Copy example environment file
cp .env.example .env

# Edit .env — fill in required values
# At minimum: DATABASE_URL, SESSION_SECRET
```

### 2. Start infrastructure

```bash
# Start PostgreSQL (and other services) via Docker Compose
docker compose up -d db

# Verify PostgreSQL is ready
docker compose exec db psql -U proofhire -c "SELECT version();"
```

### 3. Run database migrations

```bash
cd apps/api
npm install
npm run db:migrate
```

### 4. Start the API

```bash
# From apps/api
npm run dev
# API running at http://localhost:4000
```

### 5. Start the web app

```bash
# From apps/web
npm install
npm run dev
# Web app running at http://localhost:3000
```

### 6. Start the AI service (optional)

```bash
# From apps/ai-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# AI service at http://localhost:8000
```

### One-command local startup (after initial setup)

```bash
docker compose up
```

---

## Running Tests

```bash
# API unit and integration tests
cd apps/api && npm test

# Web app tests
cd apps/web && npm test

# AI service tests
cd apps/ai-service && python -m pytest

# Type checking (all TypeScript packages)
npm run typecheck --workspaces

# Linting (all packages)
npm run lint --workspaces
```

> Tests that require a running database use a separate test database. See `docs/engineering/testing-strategy.md`.

---

## Key Documentation

| Document | Location |
|---|---|
| Problem statement | `docs/product/problem-statement.md` |
| Product requirements | `docs/product/product-requirements-document.md` |
| MVP scope | `docs/product/mvp-scope-and-out-of-scope.md` |
| System context | `docs/architecture/system-context.md` |
| Data model | `docs/architecture/data-model.md` |
| Authentication design | `docs/architecture/authentication-and-authorization.md` |
| Architecture decisions | `docs/architecture/adr/` |
| Testing strategy | `docs/engineering/testing-strategy.md` |
| Security policy | `SECURITY.md` |
| Runbook | `docs/engineering/runbook.md` |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, branching conventions, and code standards.

---

## Security

See [SECURITY.md](SECURITY.md) for the security policy and how to report vulnerabilities.

**Do not open a public GitHub issue to report a security vulnerability.**

---

## Licence

To be determined. This repository is not yet open-source.

---

## Project Status

| Milestone | Status |
|---|---|
| 0 — Discovery and Audit | 🟡 In progress |
| 1 — Engineering Foundation | ⬜ Not started |
| 2 — Authentication | ⬜ Not started |
| 3 — Core Hiring Workflow | ⬜ Not started |
| 4 — Evidence-Centred Review | ⬜ Not started |
| 5 — AI Capabilities | ⬜ Not started |
| 6 — Performance and DSA | ⬜ Not started |
| 7 — Production Readiness | ⬜ Not started |

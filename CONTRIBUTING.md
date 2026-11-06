# Contributing to ProofHire

Thank you for contributing. This document explains the development workflow, standards, and conventions used on this project.

---

## Development Environment Setup

See [README.md](README.md) for complete setup instructions.

The short version:
```bash
cp .env.example .env  # configure required values
docker compose up -d db
cd apps/api && npm install && npm run db:migrate && npm run dev
cd apps/web && npm install && npm run dev
```

---

## Branch Conventions

| Branch | Purpose |
|---|---|
| `main` | Stable, deployable code. Protected. |
| `milestone/N-description` | Work for a specific milestone |
| `feat/short-description` | New features |
| `fix/short-description` | Bug fixes |
| `chore/short-description` | Tooling, deps, docs, no behaviour change |
| `security/short-description` | Security fixes — do not describe the vulnerability in the branch name |

---

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[Optional body — explain WHY, not WHAT]

[Optional footer: BREAKING CHANGE: ... or Fixes #issue]
```

**Types:** `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `security`, `perf`

**Scope examples:** `auth`, `candidate`, `employer`, `jobs`, `applications`, `evidence`, `admin`, `api`, `web`, `ai-service`, `infra`

**Examples:**
```
feat(auth): implement Argon2id password hashing

fix(applications): prevent duplicate applications via unique constraint

docs(data-model): add evidence_mappings table definition

test(auth): add negative test for expired session token
```

---

## Code Standards

### TypeScript (API and Web)

- Strict mode is mandatory (`"strict": true` in tsconfig).
- `any` is prohibited unless the `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comment is accompanied by a written justification.
- All public functions have explicit return types.
- No unused imports or variables — enforced by ESLint.
- No `console.log` in production code — use the structured logger.
- Error handling is explicit — no swallowed exceptions.

### Python (AI Service)

- Type hints on all function signatures.
- Pydantic models for all request and response schemas.
- No bare `except:` — always specify the exception type.
- Structured logging; no `print()` in production code.

### SQL

- All migrations are named: `NNN_description.sql` (zero-padded).
- Every new table has: primary key, `created_at`, foreign keys, relevant indexes.
- Prefer database constraints over application-layer validation alone.
- Include rollback SQL in migration files where practical.

---

## Testing Requirements

A change is not complete until relevant tests pass.

| Change type | Tests required |
|---|---|
| New API endpoint | Integration test covering happy path + at least 2 negative cases (auth, invalid input) |
| New business rule | Unit test covering the rule and edge cases |
| New database table | Migration test (fresh run + idempotency check) |
| Auth or authorisation change | Security regression test |
| Bug fix | Regression test that would have caught the bug |

Run tests before submitting:
```bash
cd apps/api && npm test
cd apps/web && npm test
cd apps/ai-service && python -m pytest
```

---

## Linting and Type Checking

Both must pass before a PR can be merged:

```bash
# From repository root
npm run lint --workspaces
npm run typecheck --workspaces

# Python
cd apps/ai-service
ruff check .
mypy .
```

---

## Definition of Done Checklist

Before submitting a feature for review, confirm:

- [ ] Requirements and acceptance criteria documented or referenced
- [ ] Implementation matches approved scope (no undiscussed extras)
- [ ] Tests written and passing
- [ ] Linting and type checks pass
- [ ] Database migrations run on a clean database
- [ ] Error cases and access-control boundaries tested
- [ ] No secrets or sensitive data committed
- [ ] Documentation updated (API docs, relevant architecture docs if needed)
- [ ] Remaining known limitations stated in the PR description

---

## Pull Request Process

1. Open a PR against `main` (or the relevant milestone branch).
2. Fill in the PR template.
3. Self-review the diff before requesting review.
4. Address review comments before merging.
5. Squash-merge is preferred for feature branches to keep history clean.
6. Delete the branch after merge.

---

## Architecture Decisions

If a PR introduces a significant technical decision (new library, new pattern, changed data model, new service), create or update an ADR in `docs/architecture/adr/`.

See the ADR template in `docs/architecture/adr/README.md`.

---

## Security

- Never commit `.env` files, credentials, API keys, or production data.
- If you suspect a security issue in the codebase, report it via the process in [SECURITY.md](SECURITY.md) before creating a PR.
- Security-sensitive changes (auth, session handling, authorisation, input validation) require explicit security review.

---

## Questions

For questions about the codebase, product direction, or architecture, open a discussion or check the open questions log at `docs/product/open-questions-and-decisions.md`.

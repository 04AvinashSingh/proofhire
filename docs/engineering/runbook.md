# Operational Runbook

**Date:** 2026-10-21  
**Milestone:** 1 — Engineering Foundation  

---

## 1. Local Development Operations

### 1.1 Prerequisites
- Node.js >= 20.0.0 (`node -v`)
- npm >= 10.0.0 (`npm -v`)
- Docker Engine >= 24.0.0 (`docker -v`)

### 1.2 Starting the Environment

```bash
# 1. Install all dependencies across workspaces
npm install

# 2. Build the shared contracts package
npm run build --workspace=@proofhire/shared-contracts

# 3. Start PostgreSQL using Docker Compose
docker compose up -d db

# 4. Run database migrations
npm run db:migrate --workspace=@proofhire/api

# 5. Start the backend API in watch mode
npm run dev:api

# 6. In a separate terminal, start the web app
npm run dev:web
```

---

## 2. Testing and Quality Gates

Execute all checks before committing code:

```bash
# Run unit and integration tests across all workspaces
npm run test

# Run TypeScript strict typecheck across all workspaces
npm run typecheck

# Build all applications and packages
npm run build
```

---

## 3. Database Schema Operations

```bash
# Generate a new migration after editing schema files (src/db/schema/*)
npm run db:generate --workspace=@proofhire/api

# Apply pending migrations to the local database
npm run db:migrate --workspace=@proofhire/api

# Launch Drizzle Studio to inspect and edit database records
npm run db:studio --workspace=@proofhire/api
```

---

## 4. Diagnostics & Probes

| Check | URL | Expected Response |
|---|---|---|
| Liveness | `http://localhost:4000/health` | HTTP 200 `{"status":"ok", ...}` |
| Readiness | `http://localhost:4000/ready` | HTTP 200 `{"status":"ready", "checks":{"database":"healthy"}}` |
| Web App | `http://localhost:3000` | ProofHire homepage with interactive role previews |
| Web Diagnostics | `http://localhost:3000/status` | Live system probe view with latency & raw payload inspector |

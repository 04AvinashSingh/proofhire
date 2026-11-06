# ADR-006: Artifact Upload and Storage Strategy

**Date:** 2026-10-21  
**Status:** Accepted  
**Deciders:** Engineering team

---

## Context

Candidates must demonstrate their engineering competence by uploading design artifacts, architectural diagrams (PNG, SVG, PDF), and technical documents. These artifacts must be securely stored, virus-scanned in production, access-controlled, and linked to projects and claimed competencies.

---

## Options Considered

### Option A: Direct Local Filesystem Storage (Selected for MVP)
Store uploaded files in a mounted local volume (`/app/apps/api/uploads`) with content-hash-based paths and metadata stored in the database. Serve files through an authenticated API endpoint.

**Pros:**
- Zero external cloud dependencies for local development and self-contained execution.
- Fast, deterministic integration tests without mocking S3 network calls.
- Full access control: files are served via API handlers that enforce authorization before streaming bytes.

**Cons:**
- In production, multi-instance horizontal scaling requires a shared volume (e.g. NFS) or S3-compatible object store.

### Option B: Cloud Object Storage (S3 / Cloudflare R2 / GCS)
Store files directly in an S3-compatible bucket, with presigned upload and download URLs.

**Pros:**
- Unlimited scaling, high availability.
- Offloads streaming traffic from API nodes.

**Cons:**
- Requires cloud credentials or running MinIO locally for development.

---

## Decision

**Abstracted Storage Provider with Local Filesystem implementation for development/MVP.**

1. An interface `StorageProvider` is defined with `saveFile`, `getFile`, `deleteFile`.
2. `LocalStorageProvider` implements this interface using the local disk (`apps/api/uploads/`).
3. Files are stored with cryptographically generated UUID names and strict extension whitelisting:
   - Allowed MIME types: `image/png`, `image/jpeg`, `image/svg+xml`, `application/pdf`, `text/plain`, `text/markdown`.
   - Max file size: 10 MB per artifact.
4. Files are never stored under client-supplied filenames to prevent path traversal attacks.
5. In Milestone 6 / production deployment, a `CloudStorageProvider` (S3/R2) can be plugged in without changing domain logic.

---

## Consequences

- Secure, path-traversal-proof local storage ready immediately.
- Works in Docker Compose via `api-uploads` volume.
- Easily swappable to cloud object storage when deploying to production.

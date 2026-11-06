# Authentication and Authorisation

---

## 1. Authentication Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant API as Core API
    participant DB as PostgreSQL

    B->>API: POST /api/v1/auth/register {email, password, role, fullName}
    API->>API: Validate input (Zod)
    API->>DB: Check email uniqueness
    API->>API: Hash password (Argon2id)
    API->>DB: INSERT users + candidate_profiles or org invitation
    API->>API: Generate email verification token
    API-->>B: 201 Created (no auto-login on register)

    B->>API: POST /api/v1/auth/login {email, password}
    API->>DB: SELECT user WHERE email = ?
    API->>API: Verify password hash (Argon2id.verify)
    API->>DB: INSERT sessions (token_hash, user_id, expires_at)
    API-->>B: 200 OK + Set-Cookie: session=<token>; HttpOnly; Secure; SameSite=Strict

    B->>API: GET /api/v1/me (with cookie)
    API->>DB: SELECT session WHERE token_hash = SHA256(cookie_value) AND expires_at > NOW()
    API->>DB: SELECT user WHERE id = session.user_id
    API-->>B: 200 OK {user object}
```

---

## 2. Authorisation Model

### 2.1 Roles

| Role | Capabilities |
|---|---|
| `CANDIDATE` | Own profile, own applications, job search |
| `EMPLOYER` | Organisation management (within their org), job management, application review |
| `ADMIN` | All of the above + account restriction, report review, audit log access |

### 2.2 Organisation Roles (Employer context)

| Org Role | Capabilities |
|---|---|
| `OWNER` | Full org management, billing (future), member management, all job and application access |
| `ADMIN` | Job creation, application review, team management (cannot modify owner) |
| `MEMBER` | Application review (read), evaluation notes |

### 2.3 Object-Level Authorisation Rules

Every API handler enforces object-level authorisation. The following rules are invariants:

| Resource | Who can access |
|---|---|
| Candidate profile | The candidate themselves; employers whose org has a `PUBLISHED` job the candidate applied to; `ADMIN` |
| Application | The candidate who submitted it (status only); org members of the job's organisation; `ADMIN` |
| Evaluation notes | Org members of the job's organisation; `ADMIN` — never the candidate |
| Evidence mappings | Same as Application |
| Job (DRAFT) | Org members of the job's organisation only |
| Job (PUBLISHED) | Anyone; public |
| Org membership | Org members can see other members; only OWNER can modify |
| Audit events | `ADMIN` only |
| Content reports | `ADMIN` only (reporter can see their own report status) |

---

## 3. CSRF Protection

With `SameSite=Strict` cookies, cross-site form submissions do not include the session cookie. This provides strong CSRF protection for modern browsers.

As defence-in-depth, state-changing endpoints (POST, PUT, PATCH, DELETE) also require a CSRF token using the double-submit cookie pattern:
1. On session creation, a CSRF token is issued as a separate cookie: `csrf=<token>; Secure; SameSite=Strict` (NOT HttpOnly — JavaScript must read it).
2. The client reads the CSRF token from this cookie and sends it in the `X-CSRF-Token` request header.
3. The API middleware verifies that the `X-CSRF-Token` header matches the `csrf` cookie value.

This is safe because a cross-origin attacker cannot read the `csrf` cookie value even though it is not `HttpOnly`.

---

## 4. Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| POST /auth/login | 5 attempts per IP | 15 minutes |
| POST /auth/register | 10 per IP | 1 hour |
| POST /auth/forgot-password | 5 per IP | 1 hour |
| POST /auth/verify-email | 10 per IP | 1 hour |
| All other authenticated endpoints | 200 per user | 1 minute |

Rate limit state is maintained in memory (sufficient for MVP; switch to Redis-backed if multiple API instances are needed).

---

## 5. Session Lifecycle

```
Register → [Unverified] → [Verify email] → [Active]
[Active] → Login → Session created (TTL: 2 hours idle, max 24 hours)
[Active] → Logout → Session deleted from DB
[Active] → Password reset → All sessions for user deleted
[Active] → Account suspended → All sessions for user deleted; future logins rejected
[Active] → Session expired → Auto-deleted by cleanup job
```

---

## 6. Password Reset Flow

```
User submits email → Generate secure random token (32 bytes) → 
Hash token (SHA-256) → Store in password_reset_tokens table with expiry (1 hour) →
Send email with raw token → User clicks link → 
API validates token (hash lookup) → token not expired → single-use (deleted after use) →
User submits new password → Hash with Argon2id → Update users.password_hash →
Delete ALL sessions for this user → Confirm reset
```

`password_reset_tokens` table:
```sql
CREATE TABLE password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 7. Email Verification Flow

```
Register → Generate verification token (32 bytes) → Hash → Store in email_verification_tokens →
Send verification email → User clicks link → 
API validates token → Mark users.email_verified = TRUE → Delete token →
Allow access to features requiring verified email
```

`email_verification_tokens` table:
```sql
CREATE TABLE email_verification_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 8. Revision History

| Date | Author | Change |
|---|---|---|
| 2026-10-21 | ProofHire Engineering | Initial draft |

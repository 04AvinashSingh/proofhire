# ADR-004: HttpOnly Cookies for Session Storage

**Date:** 2026-10-21  
**Status:** Accepted  
**Deciders:** Engineering team

---

## Context

ProofHire is a browser-based application. After authentication, the server must issue a credential that the browser sends on subsequent requests. The choice of where and how to store this credential has direct security consequences, particularly regarding XSS and CSRF attacks.

---

## Options Considered

### Option A: HttpOnly, Secure, SameSite=Strict Cookie (Session Token)
The server issues an opaque session token stored in a cookie with the following attributes:
- `HttpOnly`: JavaScript cannot read the cookie — mitigates XSS-based session theft.
- `Secure`: Only sent over HTTPS — mitigates network interception.
- `SameSite=Strict`: Cookie is only sent with same-site requests — strong CSRF mitigation.

**CSRF consideration:** With `SameSite=Strict`, CSRF attacks that rely on cross-site form submission do not include the cookie. However, for state-changing requests, an additional CSRF token is implemented as defence-in-depth.

**Session storage:** Server maintains session state in PostgreSQL (session table with expiry).

**Pros:**
- `HttpOnly` prevents JavaScript from accessing the session token — XSS cannot steal the credential.
- `SameSite=Strict` prevents cross-site form submission attacks.
- Sessions can be revoked server-side (password reset, logout, account suspension).
- No credential exposure in browser memory, logs, or local storage.

**Cons:**
- Requires server-side session storage (adds a session table to the database).
- CSRF protection requires additional middleware for any environment where `SameSite=Strict` may not be fully enforced (older browsers).
- Cookie-based auth requires CORS configuration if the API and frontend are on different origins in production.

### Option B: JWT in localStorage
The server issues a signed JWT. The frontend stores it in `localStorage` and sends it as a `Bearer` token in `Authorization` headers.

**Pros:**
- Stateless — server does not need to store sessions.
- Easy to use with non-browser clients (mobile apps, API clients).

**Cons:**
- `localStorage` is accessible by any JavaScript running on the page. XSS attacks can steal the JWT and exfiltrate it.
- JWTs are not revocable without a server-side blocklist — which eliminates the statelessness benefit.
- Logout does not actually invalidate the token if it has not expired.
- OWASP explicitly recommends **against** storing sensitive tokens in localStorage.
- Password reset cannot guarantee token invalidation without maintaining a blocklist.

**Decision:** localStorage storage of session tokens is rejected. This is a security invariant.

### Option C: JWT in HttpOnly Cookie (Stateless)
The server issues a signed JWT stored in an HttpOnly cookie. The server validates the JWT on each request without database lookup.

**Pros:**
- Stateless session validation (no DB query per request).
- `HttpOnly` prevents XSS access.

**Cons:**
- JWTs cannot be truly revoked before expiry without a server-side blocklist.
- Account suspension or password reset cannot reliably invalidate existing tokens without the blocklist.
- The blocklist re-introduces server state, eliminating the statelessness benefit.
- For a hiring platform where account suspension must take immediate effect, stateless JWTs are inadequate.

**Decision:** Stateless JWT in cookie is rejected for ProofHire because immediate session revocation is required (account suspension, password reset, logout).

### Option D: Opaque Session Token in HttpOnly Cookie (Selected)
An opaque, cryptographically random session token stored in an HttpOnly cookie. Session metadata (user ID, expiry, device) stored in the PostgreSQL sessions table. On each request, the token is looked up in the database.

**Pros:**
- Immediate revocation on logout, password reset, or account suspension.
- `HttpOnly` prevents XSS access.
- `SameSite=Strict` provides strong CSRF protection.
- Audit trail: session creation and destruction are database events.

**Cons:**
- One DB lookup per authenticated request. Acceptable at MVP scale. Can be mitigated with a short-lived in-memory cache if needed, but only for read-only session data.

---

## Decision

**Option D: Opaque session token in an HttpOnly, Secure, SameSite=Strict cookie.**

Session tokens are:
- 32 bytes of cryptographically random data, hex-encoded (64 characters).
- Generated using `crypto.randomBytes(32)` (Node.js built-in).
- Stored hashed (SHA-256) in the sessions table — the raw token is never persisted.
- Set in a cookie: `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=7200` (2 hours).

Session invalidation occurs on:
- Explicit logout.
- Password reset.
- Account suspension.
- Session expiry (TTL enforced in the database).

A CSRF double-submit token is implemented for state-changing endpoints as defence-in-depth.

---

## Consequences

**Easier:**
- Immediate session revocation for security events.
- Standard browser security model.
- Audit trail for session lifecycle.

**Harder:**
- One database query per authenticated request (acceptable at MVP scale; add session caching if latency measurements warrant it).
- CORS setup in production if frontend and API are on different origins (must set `credentials: 'include'` on fetch calls and appropriate `Access-Control-Allow-Origin` headers).

---

## Revisit Conditions

- API is used by mobile clients or non-browser clients that cannot use cookies — consider a parallel Bearer token flow for those clients.
- Session lookup becomes a measured bottleneck — evaluate in-memory session cache with appropriate invalidation.

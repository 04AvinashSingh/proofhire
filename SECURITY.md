# Security Policy

## Supported Versions

ProofHire is currently in pre-release development (Milestone 0). There are no production deployments.

When production releases exist, this table will be updated with supported version ranges.

---

## Reporting a Vulnerability

**Do not open a public issue to report a security vulnerability.**

If you discover a security vulnerability in ProofHire, please report it privately:

1. **Email:** [security contact — to be configured before production launch]
2. **Subject line:** `[SECURITY] Brief description`
3. **Include:**
   - Description of the vulnerability and its potential impact
   - Steps to reproduce
   - Any supporting evidence (screenshots, proof-of-concept code)
   - Your preferred contact method for follow-up

We aim to acknowledge security reports within **48 hours** and to provide an initial assessment within **7 days**.

We will not take legal action against researchers who report vulnerabilities in good faith and follow this policy.

---

## Scope

The following are **in scope** for security research:
- The web application (React frontend)
- The core API (Node.js/Express backend)
- The AI service (Python/FastAPI)
- Authentication and session management
- Object-level authorisation (can Employer A access Employer B's data?)
- SQL injection, XSS, CSRF, SSRF
- Data exposure through AI retrieval (prompt injection, data exfiltration)

The following are **out of scope**:
- Denial of service attacks
- Social engineering of ProofHire team members
- Physical attacks against infrastructure
- Spam or bulk automated testing

---

## Security Architecture Overview

Key security design decisions:

| Area | Decision |
|---|---|
| Password hashing | Argon2id (see `docs/architecture/adr/ADR-003-password-hashing.md`) |
| Session storage | HttpOnly, Secure, SameSite=Strict cookies (see ADR-004) |
| CSRF protection | Double-submit cookie pattern + SameSite=Strict |
| Input validation | Zod schema validation on all untrusted inputs |
| Object-level authorisation | Enforced per-handler with explicit permission checks |
| Secrets management | Environment variables only; never in source code |
| AI provider keys | Server-side only; never exposed to clients |
| Candidate data privacy | Minimal collection; explicit consent; DPDP Act (India) obligations |

---

## Known Limitations (Pre-Production)

The following security features are documented as pending implementation:

- Virus scanning of uploaded files (deferred to production readiness — Milestone 7)
- SSRF protections for external URL fetching (implemented in Milestone 3 with file/URL upload)
- Production secrets management (to be configured before production deployment)
- Full DPDP Act compliance review (required before launch)

---

## Disclosure Policy

After a vulnerability is resolved, we will publish a disclosure summary with:
- The nature of the vulnerability
- The impact assessment
- The fix applied
- Credit to the reporter (with their consent)

---

## Revision History

| Date | Change |
|---|---|
| 2026-10-21 | Initial draft — pre-production |

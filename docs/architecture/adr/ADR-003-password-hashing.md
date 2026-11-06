# ADR-003: Argon2id for Password Hashing

**Date:** 2026-10-21  
**Status:** Accepted  
**Deciders:** Engineering team

---

## Context

ProofHire stores user credentials. Passwords must be hashed before storage. The hashing algorithm must be resistant to GPU-based brute-force attacks and credential stuffing. This is a security invariant with no acceptable compromise.

---

## Options Considered

### Option A: Argon2id
The winner of the Password Hashing Competition (2015). Designed specifically for password hashing. Resistant to GPU and ASIC attacks through configurable memory cost. The `id` variant provides resistance to both side-channel and GPU attacks.

**Recommended parameters (OWASP 2024):**
- `memoryCost`: 64 MB (65536 KB)
- `timeCost`: 3 iterations
- `parallelism`: 4

**Node.js library:** `@node-rs/argon2` (native binding, maintained) or `argon2` npm package.

**Pros:**
- OWASP recommended for new systems as of 2024.
- Memory-hardness makes it significantly more expensive to attack with GPU clusters.
- Configurable cost parameters allow tuning without algorithm change.

**Cons:**
- Higher memory usage per hash operation than bcrypt. Acceptable at the MVP scale; needs monitoring at high concurrent registration/login volume.

### Option B: bcrypt
A widely used, battle-tested password hashing algorithm.

**Pros:**
- Widely supported, very few known vulnerabilities.
- Available in a mature npm package (`bcrypt` or `bcryptjs`).

**Cons:**
- Maximum password length of 72 bytes — passwords longer than 72 bytes are silently truncated. This is a non-obvious footgun.
- Not memory-hard — GPU attacks are cheaper than against Argon2id.
- OWASP recommends Argon2id for new systems.

### Option C: scrypt
A memory-hard function available in Node.js crypto.

**Pros:**
- Memory-hard.
- Available in Node.js standard library without dependencies.

**Cons:**
- Argon2id is preferred over scrypt by OWASP for new systems.
- Less community awareness of correct parameters.

### Option D: PBKDF2
FIPS 140-2 compliant. Available in Node.js crypto.

**Pros:**
- FIPS compliance if required.

**Cons:**
- Not memory-hard. GPU attacks are significantly cheaper than against Argon2id.
- OWASP recommends Argon2id unless FIPS compliance is required.

---

## Decision

**Argon2id** with the following parameters:
- Memory cost: 64 MB
- Time cost: 3
- Parallelism: 4

**Library:** `@node-rs/argon2` (native binding for performance; falls back gracefully in environments without native compilation support).

**Invariants:**
- Plain-text passwords are never stored, logged, or returned in API responses.
- Password comparison is always done using the library's constant-time comparison function, never with `===`.
- Hash parameters are stored with the hash (Argon2 format includes them); upgrading parameters in the future only requires re-hashing on next successful login.

---

## Consequences

**Easier:**
- OWASP-compliant security posture from day one.
- Future parameter upgrades are non-breaking (lazy re-hash on login).

**Harder:**
- Higher memory usage per hash. At 100 concurrent logins, this is 6.4 GB of peak memory if fully parallelised — this is unrealistic at MVP scale but should be monitored.
- Native binary dependency requires careful handling in CI and Docker build.

---

## Revisit Conditions

- A successor algorithm with a strong security record and wider adoption is recommended by OWASP for new systems.
- FIPS 140-2 compliance becomes a customer or regulatory requirement (switch to PBKDF2 with SHA-256, 600,000 iterations).

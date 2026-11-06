import { describe, it, expect } from "vitest";
import { SessionService } from "./sessionService.js";

describe("SessionService (Tokens & Hashing)", () => {
  it("generates 64-character hex session tokens (32 bytes entropy)", () => {
    const token = SessionService.generateRawToken();
    expect(token).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
  });

  it("generates distinct random tokens on each invocation", () => {
    const token1 = SessionService.generateRawToken();
    const token2 = SessionService.generateRawToken();
    expect(token1).not.toBe(token2);
  });

  it("computes deterministic SHA-256 token hash", () => {
    const rawToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const hash1 = SessionService.hashToken(rawToken);
    const hash2 = SessionService.hashToken(rawToken);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
  });

  it("generates CSRF token with adequate entropy", () => {
    const csrf1 = SessionService.generateCsrfToken();
    const csrf2 = SessionService.generateCsrfToken();
    expect(csrf1).toHaveLength(64);
    expect(csrf1).not.toBe(csrf2);
  });
});

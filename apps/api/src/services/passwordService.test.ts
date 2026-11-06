import { describe, it, expect } from "vitest";
import { PasswordService } from "./passwordService.js";

describe("PasswordService (Argon2id)", () => {
  it("produces an Argon2id formatted hash", async () => {
    const plaintext = "SuperSecretPassword123!";
    const hash = await PasswordService.hashPassword(plaintext);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe("string");
    // Argon2id hashes have $argon2id$ format header
    expect(hash.startsWith("$argon2id$")).toBe(true);
  });

  it("successfully verifies the correct password", async () => {
    const plaintext = "CorrectHorseBatteryStaple";
    const hash = await PasswordService.hashPassword(plaintext);

    const isValid = await PasswordService.verifyPassword(hash, plaintext);
    expect(isValid).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const plaintext = "MyValidPassword456";
    const hash = await PasswordService.hashPassword(plaintext);

    const isValid = await PasswordService.verifyPassword(hash, "WrongPassword789");
    expect(isValid).toBe(false);
  });

  it("handles empty or invalid inputs gracefully without throwing uncaught exceptions", async () => {
    expect(await PasswordService.verifyPassword("", "password")).toBe(false);
    expect(await PasswordService.verifyPassword("invalid_hash_string", "password")).toBe(false);
    await expect(PasswordService.hashPassword("")).rejects.toThrow();
  });
});

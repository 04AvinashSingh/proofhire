import * as argon2 from "@node-rs/argon2";
import { env } from "../config/env.js";

// OWASP 2024 recommended parameters (ADR-003)
// In test environments, lowered cost ensures fast integration test execution
const DEFAULT_OPTIONS: argon2.Options = {
  memoryCost: env.NODE_ENV === "test" ? 4096 : 65536, // 64 MB in dev/prod, 4 MB in tests
  timeCost: env.NODE_ENV === "test" ? 1 : 3,
  outputLen: 32,
  parallelism: env.NODE_ENV === "test" ? 1 : 4,
};

export class PasswordService {
  /**
   * Pre-computed dummy Argon2id hash used to equalize execution timing
   * when authenticating non-existent user accounts (mitigating account enumeration).
   */
  public static readonly DUMMY_HASH =
    "$argon2id$v=19$m=4096,t=1,p=1$c29tZXNhbHQ$RdescudvJCsgqlfreSAeYFlGqwagAnkIDAOstKEAqpx_518";

  /**
   * Hashes a plaintext password using Argon2id with memory-hard parameters.
   * Plaintext passwords are never stored, logged, or returned in API responses.
   */
  public static async hashPassword(plaintext: string): Promise<string> {
    if (!plaintext || typeof plaintext !== "string") {
      throw new Error("Password must be a non-empty string");
    }
    return argon2.hash(plaintext, DEFAULT_OPTIONS);
  }

  /**
   * Verifies a plaintext password against an Argon2id hash using constant-time comparison.
   */
  public static async verifyPassword(
    hash: string,
    plaintext: string
  ): Promise<boolean> {
    if (!hash || !plaintext) {
      return false;
    }
    try {
      return await argon2.verify(hash, plaintext);
    } catch {
      return false;
    }
  }
}

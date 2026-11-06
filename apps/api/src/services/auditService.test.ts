import { describe, it, expect, vi } from "vitest";
import { computeAuditHash, GENESIS_HASH, AuditService } from "./auditService.js";

describe("Audit Service & Tamper Resistance", () => {
  it("computes deterministic SHA-256 hash for audit events", () => {
    const fixedDate = new Date("2026-10-31T12:00:00.000Z");
    const hash1 = computeAuditHash({
      prevHash: GENESIS_HASH,
      eventType: "AUTH_LOGIN_SUCCESS",
      actorId: "user-123",
      targetType: "USER",
      targetId: "user-123",
      metadata: { ip: "127.0.0.1" },
      createdAt: fixedDate,
    });

    const hash2 = computeAuditHash({
      prevHash: GENESIS_HASH,
      eventType: "AUTH_LOGIN_SUCCESS",
      actorId: "user-123",
      targetType: "USER",
      targetId: "user-123",
      metadata: { ip: "127.0.0.1" },
      createdAt: fixedDate,
    });

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it("produces identical SHA-256 hash regardless of object key order (RFC 8785 canonicalization)", () => {
    const fixedDate = new Date("2026-10-31T12:00:00.000Z");
    const hashA = computeAuditHash({
      prevHash: GENESIS_HASH,
      eventType: "JOB_PUBLISHED",
      actorId: "emp-1",
      targetType: "JOB",
      targetId: "job-1",
      metadata: { organisationId: "org-123", title: "Backend Engineer", tags: ["ts", "pg"] },
      createdAt: fixedDate,
    });

    const hashB = computeAuditHash({
      prevHash: GENESIS_HASH,
      eventType: "JOB_PUBLISHED",
      actorId: "emp-1",
      targetType: "JOB",
      targetId: "job-1",
      metadata: { title: "Backend Engineer", tags: ["ts", "pg"], organisationId: "org-123" },
      createdAt: fixedDate,
    });

    expect(hashA).toBe(hashB);
  });

  it("detects modification of metadata or timestamps in hash verification", () => {
    const fixedDate = new Date("2026-10-31T12:00:00.000Z");
    const originalHash = computeAuditHash({
      prevHash: GENESIS_HASH,
      eventType: "JOB_PUBLISHED",
      actorId: "employer-1",
      targetType: "JOB",
      targetId: "job-1",
      metadata: { title: "Backend Engineer" },
      createdAt: fixedDate,
    });

    // Tampered title in metadata
    const tamperedHash = computeAuditHash({
      prevHash: GENESIS_HASH,
      eventType: "JOB_PUBLISHED",
      actorId: "employer-1",
      targetType: "JOB",
      targetId: "job-1",
      metadata: { title: "Senior Architect (Tampered)" },
      createdAt: fixedDate,
    });

    expect(tamperedHash).not.toBe(originalHash);
  });

  it("chains subsequent events onto the previous event hash", () => {
    const date1 = new Date("2026-10-31T12:00:00.000Z");
    const date2 = new Date("2026-10-31T12:05:00.000Z");

    const event1Hash = computeAuditHash({
      prevHash: GENESIS_HASH,
      eventType: "AUTH_REGISTER",
      actorId: "user-1",
      targetType: "USER",
      targetId: "user-1",
      metadata: {},
      createdAt: date1,
    });

    const event2Hash = computeAuditHash({
      prevHash: event1Hash,
      eventType: "APPLICATION_SUBMITTED",
      actorId: "user-1",
      targetType: "APPLICATION",
      targetId: "app-1",
      metadata: { jobId: "job-1" },
      createdAt: date2,
    });

    expect(event2Hash).not.toBe(event1Hash);
    expect(event1Hash).toHaveLength(64);
    expect(event2Hash).toHaveLength(64);
  });

  it("enforces immutable audit invariant by having no delete or update methods", () => {
    const service = new AuditService();
    expect((service as any).deleteEvent).toBeUndefined();
    expect((service as any).delete).toBeUndefined();
    expect((service as any).updateEvent).toBeUndefined();
    expect((service as any).update).toBeUndefined();
  });
});


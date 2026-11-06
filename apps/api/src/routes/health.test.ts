import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import * as dbModule from "../db/index.js";

describe("Health & Readiness Endpoints", () => {
  const app = createApp();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /health (Liveness)", () => {
    it("returns 200 OK with valid liveness payload", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: "ok",
        version: "0.1.0",
        environment: expect.any(String),
        uptime: expect.any(Number),
        timestamp: expect.any(String),
      });
      expect(res.headers["x-request-id"]).toBeDefined();
    });
  });

  describe("GET /ready (Readiness)", () => {
    it("returns 200 OK when database is healthy", async () => {
      vi.spyOn(dbModule, "checkDatabaseConnection").mockResolvedValueOnce({
        healthy: true,
        latencyMs: 5,
      });

      const res = await request(app).get("/ready");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: "ready",
        checks: {
          database: "healthy",
        },
        uptime: expect.any(Number),
        timestamp: expect.any(String),
      });
    });

    it("returns 503 Service Unavailable when database is unhealthy", async () => {
      vi.spyOn(dbModule, "checkDatabaseConnection").mockResolvedValueOnce({
        healthy: false,
        error: "Connection refused",
      });

      const res = await request(app).get("/ready");

      expect(res.status).toBe(503);
      expect(res.body).toMatchObject({
        status: "not_ready",
        checks: {
          database: "unhealthy",
        },
      });
    });
  });

  describe("GET /metrics (Prometheus Observability)", () => {
    it("returns 200 OK with Prometheus exposition format text", async () => {
      const res = await request(app).get("/metrics");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/plain");
      expect(res.text).toContain("# HELP nodejs_uptime_seconds");
      expect(res.text).toContain("# TYPE nodejs_uptime_seconds gauge");
      expect(res.text).toContain("http_requests_total");
    });
  });
});

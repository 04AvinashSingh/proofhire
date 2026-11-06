import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe("Error Handling Middleware", () => {
  const app = createApp();

  it("handles 404 for nonexistent routes with standard envelope", async () => {
    const res = await request(app).get("/api/v1/nonexistent-route-xyz");

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: expect.stringContaining("not found"),
        requestId: expect.any(String),
      },
    });
  });

  it("sets x-request-id on response", async () => {
    const res = await request(app).get("/api/v1/nonexistent-route-xyz");

    expect(res.headers["x-request-id"]).toBeDefined();
    expect(res.body.error.requestId).toBe(res.headers["x-request-id"]);
  });
});

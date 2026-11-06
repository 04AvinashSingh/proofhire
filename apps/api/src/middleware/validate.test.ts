import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import { z } from "zod";
import { validateRequest } from "./validate.js";
import { errorHandler } from "./errorHandler.js";

describe("Validation Middleware", () => {
  const app = express();
  app.use(express.json());

  const sampleBodySchema = z.object({
    name: z.string().min(2),
    age: z.number().int().positive(),
  });

  app.post(
    "/test-validation",
    validateRequest({ body: sampleBodySchema }),
    (req, res) => {
      res.status(200).json({ success: true, data: req.body });
    }
  );

  app.use(errorHandler);

  it("passes valid request body and returns success", async () => {
    const res = await request(app)
      .post("/test-validation")
      .send({ name: "Alex", age: 25 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: { name: "Alex", age: 25 },
    });
  });

  it("rejects invalid request body with 400 and structured error response", async () => {
    const res = await request(app)
      .post("/test-validation")
      .send({ name: "A", age: -5 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toBeInstanceOf(Array);
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });
});

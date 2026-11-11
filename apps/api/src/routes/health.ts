import { Router, Request, Response } from "express";
import { env } from "../config/env.js";
import { checkDatabaseConnection } from "../db/index.js";
import type {
  HealthCheckResponse,
  ReadinessCheckResponse,
} from "@proofhire/shared-contracts";

const router = Router();
const APP_VERSION = "0.1.0";

/**
 * Root health & liveness probe for cloud load balancers and orchestrators (Render, K8s, Docker).
 * Handles HEAD and GET requests from health checkers like Go-http-client.
 */
router.all("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "proofhire-api",
    version: APP_VERSION,
    environment: env.NODE_ENV,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Liveness probe: returns 200 if the Node.js process is alive.
 * Used by orchestrators (Docker, Kubernetes) to decide whether to restart the container.
 */
router.get("/health", (_req: Request, res: Response) => {
  const payload: HealthCheckResponse = {
    status: "ok",
    version: APP_VERSION,
    environment: env.NODE_ENV,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(payload);
});

/**
 * Readiness probe: checks dependencies (e.g. database connectivity).
 * Returns 200 if ready to handle traffic, 503 if downstream dependencies fail.
 */
router.get("/ready", async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseConnection();

  const payload: ReadinessCheckResponse = {
    status: dbHealth.healthy ? "ready" : "not_ready",
    checks: {
      database: dbHealth.healthy ? "healthy" : "unhealthy",
    },
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };

  const statusCode = dbHealth.healthy ? 200 : 503;
  res.status(statusCode).json(payload);
});

export const healthRouter = router;

import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { logger } from "../logger.js";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      startTime?: number;
    }
  }
}

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const reqId =
    (req.headers["x-request-id"] as string) || crypto.randomUUID();
  req.id = reqId;
  req.startTime = Date.now();

  res.setHeader("x-request-id", reqId);

  // Skip noisy logs for health probes in production
  const isHealthCheck = req.path === "/health" || req.path === "/ready";

  if (!isHealthCheck) {
    logger.info(
      {
        requestId: reqId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      },
      "Incoming request"
    );
  }

  res.on("finish", () => {
    const durationMs = req.startTime ? Date.now() - req.startTime : 0;
    const logData = {
      requestId: reqId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    };

    if (res.statusCode >= 500) {
      logger.error(logData, "Request failed with 5xx");
    } else if (res.statusCode >= 400) {
      logger.warn(logData, "Request completed with client error");
    } else if (!isHealthCheck) {
      logger.info(logData, "Request completed successfully");
    }
  });

  next();
}

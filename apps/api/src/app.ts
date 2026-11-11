import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { metrics, metricsMiddleware } from "./metrics.js";
import { NotFoundError } from "./errors/AppError.js";
import { healthRouter } from "./routes/health.js";
import { v1Router } from "./routes/index.js";

export function createApp(): Express {
  const app = express();

  // Trust first proxy hop (e.g. Docker, Nginx, load balancer) for accurate rate limiting and IP audit logs
  app.set("trust proxy", 1);

  // Security headers: CSP, HSTS, frameguard, and referrer policy
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", env.CORS_ORIGIN, "http://localhost:3000", "http://localhost:4000"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: "deny",
      },
      referrerPolicy: {
        policy: "strict-origin-when-cross-origin",
      },
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, orchestrator probes)
        if (!origin) return callback(null, true);

        // If wildcard, reflect request origin so credentials (cookies) are permitted by browser
        if (!env.CORS_ORIGIN || env.CORS_ORIGIN === "*") {
          return callback(null, true);
        }

        const allowed = env.CORS_ORIGIN.split(",").map((o) => o.trim());
        if (allowed.includes(origin) || allowed.includes("*") || origin.endsWith(".vercel.app")) {
          return callback(null, true);
        }

        return callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-request-id",
        "x-csrf-token",
        "traceparent",
      ],
      exposedHeaders: ["x-request-id"],
    })
  );

  // Prometheus HTTP metrics collection middleware
  app.use(metricsMiddleware);

  // Body parsing
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // Cookie parsing for HttpOnly session cookies
  app.use(cookieParser(env.SESSION_SECRET));

  // Request logging and correlation IDs
  app.use(requestLogger);

  // Prometheus Metrics endpoint for scraping
  app.get("/metrics", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.send(metrics.render());
  });

  // Probes (direct at root for container orchestrators)
  app.use(healthRouter);

  // Core API v1 with rate limiting
  app.use("/api/v1", apiRateLimiter, v1Router);

  // Catch-all 404 handler
  app.use((req, _res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
  });

  // Centralised error handling
  app.use(errorHandler);

  return app;
}

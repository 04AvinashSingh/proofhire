import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

interface RateLimitRecord {
  timestamps: number[];
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests, please try again later.") {
    super(429, "TOO_MANY_REQUESTS", message);
  }
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) {
  const store = new Map<string, RateLimitRecord>();

  // Periodic cleanup of stale entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < options.windowMs);
      if (record.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    // In test environment, rate limiting can be bypassed or have relaxed limits
    if (process.env.NODE_ENV === "test" && !req.headers["x-test-rate-limit"]) {
      return next();
    }

    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : req.ip || req.socket.remoteAddress || "unknown_ip";

    const now = Date.now();
    let record = store.get(key);

    if (!record) {
      record = { timestamps: [] };
      store.set(key, record);
    }

    // Keep timestamps within the window
    record.timestamps = record.timestamps.filter((ts) => now - ts < options.windowMs);

    if (record.timestamps.length >= options.maxRequests) {
      const oldestTimestamp = record.timestamps[0] || now;
      const retryAfterSeconds = Math.ceil(
        (oldestTimestamp + options.windowMs - now) / 1000
      );
      res.setHeader("Retry-After", Math.max(1, retryAfterSeconds));
      return next(
        new TooManyRequestsError(
          options.message || `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`
        )
      );
    }

    record.timestamps.push(now);
    res.setHeader("X-RateLimit-Limit", options.maxRequests);
    res.setHeader("X-RateLimit-Remaining", options.maxRequests - record.timestamps.length);

    next();
  };
}

// 5 attempts per IP per 15 minutes for login
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: "Too many login attempts. Please wait 15 minutes before trying again.",
});

// 10 attempts per IP per hour for registration
export const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
  message: "Too many registration attempts from this IP. Please try again later.",
});

// 100 requests per IP per minute for general API endpoints
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: "API rate limit exceeded. Please throttle your requests.",
});


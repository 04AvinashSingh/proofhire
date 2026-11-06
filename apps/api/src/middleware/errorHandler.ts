import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { logger } from "../logger.js";
import { env } from "../config/env.js";
import type { ApiErrorResponse } from "@proofhire/shared-contracts";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.id || (req.headers["x-request-id"] as string);

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(
        {
          err,
          requestId,
          path: req.originalUrl,
          statusCode: err.statusCode,
        },
        "Operational server error"
      );
    } else {
      logger.warn(
        {
          code: err.code,
          message: err.message,
          requestId,
          path: req.originalUrl,
          statusCode: err.statusCode,
          details: err.details,
        },
        "Client error handled"
      );
    }

    const responsePayload: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    };

    res.status(err.statusCode).json(responsePayload);
    return;
  }

  // Unhandled / Unexpected error
  logger.error(
    {
      err,
      requestId,
      path: req.originalUrl,
    },
    "Unhandled exception caught by error handler"
  );

  const isProduction = env.NODE_ENV === "production";

  const responsePayload: ApiErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isProduction
        ? "An unexpected error occurred. Please try again later."
        : err.message || "Internal server error",
      details: isProduction ? undefined : { stack: err.stack },
      requestId,
    },
  };

  res.status(500).json(responsePayload);
}

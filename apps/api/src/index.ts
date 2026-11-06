import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./logger.js";
import { closeDatabaseConnection } from "./db/index.js";

const app = createApp();

const server = app.listen(env.API_PORT, () => {
  logger.info(
    {
      port: env.API_PORT,
      env: env.NODE_ENV,
      corsOrigin: env.CORS_ORIGIN,
    },
    `🚀 ProofHire Core API server started on port ${env.API_PORT}`
  );
});

// Graceful shutdown handling
let isShuttingDown = false;

async function handleShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, "Received shutdown signal, closing server gracefully...");

  // Force shutdown after 10 seconds timeout
  const forceExitTimer = setTimeout(() => {
    logger.fatal("Forcefully terminating after shutdown timeout");
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  server.close(async (err) => {
    if (err) {
      logger.error({ err }, "Error during HTTP server close");
    } else {
      logger.info("HTTP server closed to new connections");
    }

    try {
      await closeDatabaseConnection();
      logger.info("Clean shutdown completed");
      process.exit(0);
    } catch (dbErr) {
      logger.error({ dbErr }, "Error during database pool shutdown");
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled promise rejection detected");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "Uncaught exception detected");
  process.exit(1);
});

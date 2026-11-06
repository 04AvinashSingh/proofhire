import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../config/env.js";
import { logger } from "../logger.js";
import * as schema from "./schema/index.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected error on idle PostgreSQL client");
});

export const db = drizzle(pool, { schema });

export interface DatabaseHealthResult {
  healthy: boolean;
  latencyMs?: number;
  error?: string;
}

export async function checkDatabaseConnection(): Promise<DatabaseHealthResult> {
  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
      const latencyMs = Date.now() - start;
      return { healthy: true, latencyMs };
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      healthy: false,
      latencyMs: Date.now() - start,
      error: errorMessage,
    };
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  try {
    await pool.end();
    logger.info("PostgreSQL connection pool closed successfully");
  } catch (err) {
    logger.error({ err }, "Error closing PostgreSQL connection pool");
  }
}

import path from "path";
import { fileURLToPath } from "url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index.js";
import { logger } from "../logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  logger.info("Starting database migrations...");
  const migrationsFolder = path.resolve(__dirname, "../../drizzle");

  try {
    await migrate(db, { migrationsFolder });
    logger.info("Database migrations applied successfully");
  } catch (error) {
    logger.error({ error }, "Failed to apply database migrations");
    throw error;
  }
}

// If executed directly
if (process.argv[1] === __filename) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.fatal({ err }, "Migration process aborted");
      await pool.end();
      process.exit(1);
    });
}

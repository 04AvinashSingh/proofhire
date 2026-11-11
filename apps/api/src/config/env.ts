import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from cwd, or apps/api/.env, or root .env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid PostgreSQL connection URL")
    .default("postgresql://proofhire:proofhire_dev@localhost:5432/proofhire_dev"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters long")
    .default("dev_session_secret_change_in_production_min_64_chars_aaa"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  FEATURE_AI_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((val) => val === "true"),
  FEATURE_EMAIL_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((val) => val === "true"),
  AI_SERVICE_URL: z.string().url().default("http://localhost:8000"),
});

export type Env = z.infer<typeof EnvSchema>;

let parsedEnv: Env;

try {
  parsedEnv = EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const errorDetails = error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    console.error(
      `❌ Environment validation failed with the following errors:\n${errorDetails}`
    );
  } else {
    console.error("❌ Unknown error during environment validation:", error);
  }
  process.exit(1);
}

export const env = parsedEnv;

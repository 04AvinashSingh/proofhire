import { z } from "zod";

export const HealthCheckResponseSchema = z.object({
  status: z.literal("ok"),
  version: z.string(),
  environment: z.string(),
  uptime: z.number(),
  timestamp: z.string().datetime(),
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

export const ReadinessCheckResponseSchema = z.object({
  status: z.enum(["ready", "not_ready"]),
  checks: z.object({
    database: z.enum(["healthy", "unhealthy"]),
  }),
  uptime: z.number(),
  timestamp: z.string().datetime(),
});

export type ReadinessCheckResponse = z.infer<typeof ReadinessCheckResponseSchema>;

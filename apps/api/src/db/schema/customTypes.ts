import { customType } from "drizzle-orm/pg-core";

/**
 * Custom vector type for pgvector in PostgreSQL.
 * Defaults to 1536 dimensions (compatible with text-embedding-3-small and mock generator).
 */
export const vector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions?: number };
}>({
  dataType(config) {
    const dimensions = config?.dimensions ?? 1536;
    return `vector(${dimensions})`;
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        // Fallback for raw postgres vector strings "[0.1, 0.2]"
        return value
          .replace(/[\[\]]/g, "")
          .split(",")
          .map((v) => parseFloat(v.trim()));
      }
    }
    return value;
  },
});

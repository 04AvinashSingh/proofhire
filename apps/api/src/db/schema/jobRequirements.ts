import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { jobs } from "./jobs.js";

export const jobRequirements = pgTable(
  "job_requirements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    requirementText: text("requirement_text").notNull(),
    importance: text("importance").notNull(), // 'REQUIRED' | 'PREFERRED'
    evidenceTypeHint: text("evidence_type_hint"),
    skillTags: text("skill_tags").array(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_job_requirements_job").on(table.jobId)]
);

export type JobRequirement = typeof jobRequirements.$inferSelect;
export type NewJobRequirement = typeof jobRequirements.$inferInsert;

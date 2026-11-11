import { pgTable, uuid, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { jobs } from "./jobs.js";
import { users } from "./users.js";

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    coverNote: text("cover_note"),
    status: text("status").notNull().default("APPLIED"), // 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED'
    slaDeadline: timestamp("sla_deadline", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_unique_job_candidate").on(table.jobId, table.candidateId),
    index("idx_applications_job").on(table.jobId),
    index("idx_applications_candidate").on(table.candidateId),
    index("idx_applications_status").on(table.status),
  ]
);

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;

import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { applications } from "./applications.js";
import { users } from "./users.js";

export const evaluationNotes = pgTable(
  "evaluation_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    isInternal: boolean("is_internal").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_eval_notes_application").on(table.applicationId)]
);

export type EvaluationNote = typeof evaluationNotes.$inferSelect;
export type NewEvaluationNote = typeof evaluationNotes.$inferInsert;

import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { applications } from "./applications";
import { users } from "./users";

export const applicationStatusHistory = pgTable(
  "application_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    changedBy: uuid("changed_by")
      .notNull()
      .references(() => users.id),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_app_history_application").on(table.applicationId)]
);

export type ApplicationStatusHistory = typeof applicationStatusHistory.$inferSelect;
export type NewApplicationStatusHistory = typeof applicationStatusHistory.$inferInsert;

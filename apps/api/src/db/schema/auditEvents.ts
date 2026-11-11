import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: text("event_type").notNull(),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    targetType: text("target_type"),
    targetId: text("target_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ipAddress: text("ip_address"),
    prevHash: text("prev_hash"),
    tamperHash: text("tamper_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_audit_events_actor").on(table.actorId),
    index("idx_audit_events_target").on(table.targetType, table.targetId),
    index("idx_audit_events_type").on(table.eventType),
    index("idx_audit_events_created_at").on(table.createdAt),
  ]
);

export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;

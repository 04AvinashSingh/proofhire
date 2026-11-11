import { pgTable, uuid, text, timestamp, jsonb, boolean, real, index } from "drizzle-orm/pg-core";
import { applications } from "./applications.js";
import { jobRequirements } from "./jobRequirements.js";

export const aiAssessments = pgTable(
  "ai_assessments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    requirementId: uuid("requirement_id")
      .notNull()
      .references(() => jobRequirements.id, { onDelete: "cascade" }),
    supportLevel: text("support_level").notNull(), // SUPPORTED | PARTIALLY_SUPPORTED | INSUFFICIENT | CONTRADICTED
    confidence: real("confidence").notNull(),
    citations: jsonb("citations").notNull().default([]),
    limitations: jsonb("limitations").notNull().default([]),
    advisoryNotes: text("advisory_notes").notNull(),
    isSelfReported: boolean("is_self_reported").default(true).notNull(), // Rule #8
    securityWarnings: jsonb("security_warnings").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_ai_assessments_application_id").on(table.applicationId),
    index("idx_ai_assessments_requirement_id").on(table.requirementId),
  ]
);

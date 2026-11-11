import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { applications } from "./applications.js";
import { jobRequirements } from "./jobRequirements.js";
import { projectEvidence } from "./projectEvidence.js";

export const evidenceMappings = pgTable(
  "evidence_mappings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    jobRequirementId: uuid("job_requirement_id")
      .notNull()
      .references(() => jobRequirements.id, { onDelete: "cascade" }),
    projectEvidenceId: uuid("project_evidence_id").references(
      () => projectEvidence.id,
      { onDelete: "set null" }
    ),
    relevanceScore: text("relevance_score"),
    relevanceReason: text("relevance_reason"),
    isAiAssisted: boolean("is_ai_assisted").notNull().default(false),
    aiModelVersion: text("ai_model_version"),
    computedAt: timestamp("computed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_evidence_mappings_application").on(table.applicationId),
    index("idx_evidence_mappings_requirement").on(table.jobRequirementId),
  ]
);

export type EvidenceMapping = typeof evidenceMappings.$inferSelect;
export type NewEvidenceMapping = typeof evidenceMappings.$inferInsert;

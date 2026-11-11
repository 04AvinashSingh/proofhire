import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { projects } from "./projects.js";

export const projectEvidence = pgTable(
  "project_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    evidenceType: text("evidence_type").notNull(), // 'URL' | 'GITHUB_URL' | 'UPLOADED_FILE' | 'VIDEO_LINK' | 'WRITTEN_EXPLANATION'
    title: text("title").notNull(),
    description: text("description").notNull(),
    url: text("url"),
    filePath: text("file_path"),
    personalContribution: text("personal_contribution").notNull(),
    isSelfReported: boolean("is_self_reported").notNull().default(true),
    skillTags: text("skill_tags").array(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_evidence_project").on(table.projectId)]
);

export type ProjectEvidence = typeof projectEvidence.$inferSelect;
export type NewProjectEvidence = typeof projectEvidence.$inferInsert;

import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { candidateProfiles } from "./candidateProfiles.js";

export const candidateEducation = pgTable(
  "candidate_education",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidateProfiles.id, { onDelete: "cascade" }),
    institution: text("institution").notNull(),
    degree: text("degree"),
    fieldOfStudy: text("field_of_study"),
    startYear: integer("start_year"),
    endYear: integer("end_year"),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_education_candidate").on(table.candidateId)]
);

export type CandidateEducation = typeof candidateEducation.$inferSelect;
export type NewCandidateEducation = typeof candidateEducation.$inferInsert;

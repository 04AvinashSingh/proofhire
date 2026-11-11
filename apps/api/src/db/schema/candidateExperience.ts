import { pgTable, uuid, text, boolean, integer, timestamp, index } from "drizzle-orm/pg-core";
import { candidateProfiles } from "./candidateProfiles.js";

export const candidateExperience = pgTable(
  "candidate_experience",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidateProfiles.id, { onDelete: "cascade" }),
    companyName: text("company_name").notNull(),
    roleTitle: text("role_title").notNull(),
    employmentType: text("employment_type"), // 'FULL_TIME' | 'INTERNSHIP' | 'FREELANCE' | 'PART_TIME' | 'CONTRACT'
    startDate: text("start_date").notNull(), // ISO YYYY-MM or YYYY-MM-DD
    endDate: text("end_date"),
    isCurrent: boolean("is_current").notNull().default(false),
    responsibilities: text("responsibilities"),
    technologies: text("technologies").array(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_experience_candidate").on(table.candidateId)]
);

export type CandidateExperience = typeof candidateExperience.$inferSelect;
export type NewCandidateExperience = typeof candidateExperience.$inferInsert;

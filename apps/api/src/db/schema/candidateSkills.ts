import { pgTable, uuid, text, boolean, timestamp, index, unique } from "drizzle-orm/pg-core";
import { candidateProfiles } from "./candidateProfiles.js";

export const candidateSkills = pgTable(
  "candidate_skills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidateProfiles.id, { onDelete: "cascade" }),
    skillName: text("skill_name").notNull(),
    proficiency: text("proficiency").notNull(), // 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    category: text("category").notNull().default("Languages"), // 'Languages' | 'Frameworks' | 'Databases' | 'Tools'
    isSelfReported: boolean("is_self_reported").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_skills_candidate").on(table.candidateId),
    index("idx_skills_name").on(table.skillName),
    unique("uq_candidate_skill").on(table.candidateId, table.skillName),
  ]
);

export type CandidateSkill = typeof candidateSkills.$inferSelect;
export type NewCandidateSkill = typeof candidateSkills.$inferInsert;

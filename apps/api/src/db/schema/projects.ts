import { pgTable, uuid, text, boolean, integer, timestamp, index } from "drizzle-orm/pg-core";
import { candidateProfiles } from "./candidateProfiles.js";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidateProfiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    roleInProject: text("role_in_project").notNull(), // 'SOLE_DEVELOPER' | 'LEAD' | 'CONTRIBUTOR' | 'REVIEWER'
    teamSize: integer("team_size"),
    personalContribution: text("personal_contribution").notNull(),
    githubUrl: text("github_url"),
    projectUrl: text("project_url"),
    demoUrl: text("demo_url"),
    isTeamProject: boolean("is_team_project").notNull().default(false),
    startDate: text("start_date"),
    endDate: text("end_date"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_projects_candidate").on(table.candidateId)]
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

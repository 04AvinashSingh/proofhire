import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const candidateProfiles = pgTable("candidate_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  locationCity: text("location_city"),
  locationCountry: text("location_country"),
  status: text("status"), // 'STUDENT' | 'ACTIVELY_LOOKING' | 'OPEN' | 'NOT_LOOKING'
  visibility: text("visibility").notNull().default("PUBLIC"), // 'PUBLIC' | 'APPLIED_ONLY' | 'PRIVATE'
  yearsExperience: integer("years_experience"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CandidateProfile = typeof candidateProfiles.$inferSelect;
export type NewCandidateProfile = typeof candidateProfiles.$inferInsert;

import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { organisations } from "./organisations.js";
import { users } from "./users.js";

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    employmentType: text("employment_type").notNull(), // 'FULL_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'PART_TIME'
    locationCity: text("location_city"),
    locationCountry: text("location_country"),
    remoteType: text("remote_type").notNull().default("ONSITE"), // 'ONSITE' | 'REMOTE' | 'HYBRID'
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: text("salary_currency").default("INR"),
    applicationDeadline: text("application_deadline"),
    status: text("status").notNull().default("DRAFT"), // 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'
    publishedAt: timestamp("published_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_jobs_organisation").on(table.organisationId),
    index("idx_jobs_status").on(table.status),
  ]
);

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

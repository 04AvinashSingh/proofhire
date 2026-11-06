import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const organisations = pgTable(
  "organisations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    website: text("website"),
    description: text("description"),
    sizeRange: text("size_range"), // '1-10' | '11-50' | '51-200' | '201-500' | '500+'
    industry: text("industry"),
    headquarters: text("headquarters"),
    logoUrl: text("logo_url"),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_organisations_slug").on(table.slug)]
);

export type Organisation = typeof organisations.$inferSelect;
export type NewOrganisation = typeof organisations.$inferInsert;

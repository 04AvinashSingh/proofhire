import { pgTable, uuid, text, timestamp, index, unique } from "drizzle-orm/pg-core";
import { organisations } from "./organisations";
import { users } from "./users";

export const organisationMemberships = pgTable(
  "organisation_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orgRole: text("org_role").notNull(), // 'OWNER' | 'ADMIN' | 'MEMBER'
    invitedBy: uuid("invited_by").references(() => users.id),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_org_memberships_user_id").on(table.userId),
    index("idx_org_memberships_org_id").on(table.organisationId),
    unique("uq_org_memberships_org_user").on(table.organisationId, table.userId),
  ]
);

export type OrganisationMembership = typeof organisationMemberships.$inferSelect;
export type NewOrganisationMembership = typeof organisationMemberships.$inferInsert;

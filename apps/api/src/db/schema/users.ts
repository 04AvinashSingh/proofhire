import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull(), // 'CANDIDATE' | 'EMPLOYER' | 'ADMIN'
    fullName: text("full_name").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    accountStatus: text("account_status").notNull().default("ACTIVE"), // 'ACTIVE' | 'WARNED' | 'SUSPENDED' | 'BANNED'
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_users_email").on(table.email),
    index("idx_users_role").on(table.role),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

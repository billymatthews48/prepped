import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  doublePrecision,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Accounts. `users` is the spine's users table: one row per account.
// `sessions`, `accounts` and `verifications` are Better Auth's bookkeeping
// (login sessions, the hashed password, email verification tokens).
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Prepped data (PLAN.md section 3). Every row carries the owner's user_id, and
// every query filters on it, so one user can never read another user's rows.
// ---------------------------------------------------------------------------

export const MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

/** A meal I cook or eat repeatedly, with nutrition per serving. */
export const meals = pgTable(
  "meals",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slot: text("slot").$type<MealSlot>().notNull(),
    calories: integer("calories").notNull(),
    proteinG: doublePrecision("protein_g").notNull().default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("meals_user_idx").on(t.userId),
    check("meals_name_not_blank", sql`length(trim(${t.name})) > 0`),
    check("meals_calories_positive", sql`${t.calories} > 0`),
    check("meals_protein_not_negative", sql`${t.proteinG} >= 0`),
    check("meals_slot_valid", sql`${t.slot} in ('breakfast', 'lunch', 'dinner', 'snack')`),
  ],
);

/** One time I ate a meal: which meal, which day, how many servings. */
export const logEntries = pgTable(
  "log_entries",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mealId: integer("meal_id")
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    eatenOn: date("eaten_on", { mode: "string" }).notNull(),
    servings: doublePrecision("servings").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("log_entries_user_day_idx").on(t.userId, t.eatenOn),
    index("log_entries_meal_idx").on(t.mealId),
    check("log_entries_servings_positive", sql`${t.servings} > 0`),
  ],
);

/** Junction table: "this user starred this meal". One table for everyone. */
export const stars = pgTable(
  "stars",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mealId: integer("meal_id")
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.mealId] })],
);

export type Meal = typeof meals.$inferSelect;
export type LogEntry = typeof logEntries.$inferSelect;

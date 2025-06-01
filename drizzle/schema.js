import { relations, sql } from "drizzle-orm";
import { boolean, text } from "drizzle-orm/gel-core";
import {
  float,
  int,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const emailValidTable = mysqlTable("is_email_valid_table", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 8 }).notNull(),
  expiresAt: timestamp("expires_at")
    .default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 DAY)`)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersTable = mysqlTable("users_table", {
  id: int().autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  pass: varchar("pass", { length: 255 }).notNull(),
  isEmailValid: boolean("is_email_valid").default(false).notNull(),
  role: varchar("role", { length: 8 }).notNull().default("User"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const sessionTable = mysqlTable("session_table", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id),
  valid: boolean().default(true).notNull(),
  userAgent: text("user_agent"),
  ip: varchar({ length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const planTable = mysqlTable("plan_table", {
  id: int().autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slogan: varchar("slogan", { length: 255 }).notNull(),
  duration: int().notNull(),
  plan: varchar("plan", { length: 50 }).notNull(),
  link: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const paymentTable = mysqlTable("payment_table", {
  id: int().autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  plan: varchar("plan", { length: 15 }).notNull(),
  package: varchar("package", { length: 10 }).notNull(),
  amount: float("amount").notNull(),
  transId: varchar("transId", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 10 }).notNull(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const forgotPasswordTable = mysqlTable("forgot_password_table", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  hashToken: text("hash_token").notNull(),
  expiresAt: timestamp("expires_at")
    .default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 DAY)`)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const liveClassTable = mysqlTable("liveclass_table", {
  id: int().autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slogan: varchar("slogan", { length: 255 }).notNull(),
  instructor: varchar("instructor", { length: 255 }).notNull(),
  plan: varchar("plan", { length: 50 }).notNull(),
  programTime: varchar("program_time", { length: 20 }).notNull(),
  link: varchar({ length: 255 }).notNull(),
  status: boolean().default(true).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const userRelation = relations(usersTable, ({ many }) => ({
  payment: many(paymentTable),
  session: many(sessionTable),
}));

export const paymentRelation = relations(paymentTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [paymentTable.userId],
    references: [usersTable.id],
  }),
}));

export const sessionRelation = relations(sessionTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionTable.userId], //Foregin Key
    references: [usersTable.id], // Refrences
  }),
}));

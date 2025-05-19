import { relations } from "drizzle-orm";
import {
  float,
  int,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users_table", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  pass: varchar("pass", { length: 255 }).notNull(),
  role: varchar("role", { length: 8 }).notNull().default("User"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const planTable = mysqlTable("plan_table", {
  id: serial().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slogan: varchar("slogan", { length: 255 }).notNull(),
  duration: int().notNull(),
  plan: varchar("plan", { length: 50 }).notNull(),
  link: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const paymentTable = mysqlTable("payment_table", {
  id: serial().primaryKey(),
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

export const userRelation = relations(usersTable, ({ many }) => ({
  payment: many(paymentTable),
}));

export const paymentRelation = relations(paymentTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [paymentTable.userId],
    references: [usersTable.id],
  }),
}));

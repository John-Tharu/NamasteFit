import { duration } from "drizzle-orm/gel-core";
import {
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

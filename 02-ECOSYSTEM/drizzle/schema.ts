import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const tracks = mysqlTable("tracks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull(),
  genre: varchar("genre", { length: 64 }).notNull(), // pop, trap, mpb
  credits: varchar("credits", { length: 255 }).notNull(), // I, Gr, M, MA, Pr
  bpm: int("bpm"),
  duration: varchar("duration", { length: 32 }),
  audioUrl: text("audioUrl"),
  coverUrl: text("coverUrl"),
  isSingle: int("isSingle").default(0).notNull(), // 1 for official single
  status: varchar("status", { length: 64 }).default("released").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 64 }),
  genre: varchar("genre", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["briefing", "recording", "mixing", "mastering", "delivered"]).default("briefing").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  notes: text("notes"),
  stemsUrl: text("stemsUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 255 }).notNull(),
  details: text("details"),
  performedBy: varchar("performedBy", { length: 255 }).default("Duck").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

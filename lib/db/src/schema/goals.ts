import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const goalsTable = pgTable("goals", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  title: text("title").notNull(),
  target: numeric("target", { precision: 12, scale: 2 }).notNull(),
  current: numeric("current", { precision: 12, scale: 2 }).notNull().default("0"),
  deadline: text("deadline"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGoalSchema = createInsertSchema(goalsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goalsTable.$inferSelect;

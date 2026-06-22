import { pgTable, text, serial, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const budgetsTable = pgTable("budgets", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  category: text("category").notNull(),
  budget: numeric("budget", { precision: 12, scale: 2 }).notNull(),
  month: text("month").notNull(),
});

export const insertBudgetSchema = createInsertSchema(budgetsTable).omit({ id: true });
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgetsTable.$inferSelect;

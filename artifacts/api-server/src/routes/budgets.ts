import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db, budgetsTable, expensesTable } from "@workspace/db";
import { eq, and, sum } from "drizzle-orm";
import { CreateBudgetBody, UpdateBudgetBody } from "@workspace/api-zod";

const router = Router();

router.get("/budgets", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

  const budgets = await db.select().from(budgetsTable)
    .where(and(eq(budgetsTable.clerkUserId, userId), eq(budgetsTable.month, month)));

  const startDate = `${month}-01`;
  const endDate = `${month}-31`;

  const result = await Promise.all(budgets.map(async (b) => {
    const spendRows = await db.select({ total: sum(expensesTable.amount) })
      .from(expensesTable)
      .where(and(
        eq(expensesTable.clerkUserId, userId),
        eq(expensesTable.category, b.category),
        and(
          eq(expensesTable.date, startDate),
        )
      ));

    const spentRows = await db.select({ total: sum(expensesTable.amount) })
      .from(expensesTable)
      .where(
        and(
          eq(expensesTable.clerkUserId, userId),
          eq(expensesTable.category, b.category),
        )
      );

    const allSpend = await db.select({ total: sum(expensesTable.amount) })
      .from(expensesTable)
      .where(
        and(
          eq(expensesTable.clerkUserId, userId),
          eq(expensesTable.category, b.category),
        )
      );

    const spent = parseFloat(allSpend[0]?.total ?? "0");
    const budget = parseFloat(b.budget);
    const remaining = budget - spent;
    const percentage = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

    return {
      id: b.id,
      clerkUserId: b.clerkUserId,
      category: b.category,
      budget,
      month: b.month,
      spent,
      remaining,
      percentage,
    };
  }));

  res.json(result);
});

router.post("/budgets", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const parsed = CreateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;
  const rows = await db.insert(budgetsTable).values({
    clerkUserId: userId,
    category: d.category,
    budget: String(d.budget),
    month: d.month,
  }).returning();
  const b = rows[0];
  res.status(201).json({
    id: b.id,
    clerkUserId: b.clerkUserId,
    category: b.category,
    budget: parseFloat(b.budget),
    month: b.month,
  });
});

router.patch("/budgets/:id", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = UpdateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;
  const updateData: Partial<typeof budgetsTable.$inferInsert> = {};
  if (d.category !== undefined) updateData.category = d.category;
  if (d.budget !== undefined) updateData.budget = String(d.budget);
  if (d.month !== undefined) updateData.month = d.month;

  const rows = await db.update(budgetsTable)
    .set(updateData)
    .where(and(eq(budgetsTable.id, id), eq(budgetsTable.clerkUserId, userId)))
    .returning();
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const b = rows[0];
  res.json({
    id: b.id,
    clerkUserId: b.clerkUserId,
    category: b.category,
    budget: parseFloat(b.budget),
    month: b.month,
  });
});

router.delete("/budgets/:id", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(budgetsTable)
    .where(and(eq(budgetsTable.id, id), eq(budgetsTable.clerkUserId, userId)));
  res.json({ success: true });
});

export default router;

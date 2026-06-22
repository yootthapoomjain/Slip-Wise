import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db, expensesTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, or, desc, asc, count } from "drizzle-orm";
import { CreateExpenseBody, UpdateExpenseBody, ListExpensesQueryParams } from "@workspace/api-zod";

const router = Router();

function formatExpense(e: typeof expensesTable.$inferSelect) {
  return {
    id: e.id,
    clerkUserId: e.clerkUserId,
    merchant: e.merchant,
    amount: parseFloat(e.amount),
    category: e.category,
    date: e.date,
    time: e.time,
    paymentMethod: e.paymentMethod,
    reference: e.reference,
    note: e.note,
    imageUrl: e.imageUrl,
    tags: e.tags,
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/expenses", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;

  const conditions = [eq(expensesTable.clerkUserId, userId)];

  if (req.query.category) {
    conditions.push(eq(expensesTable.category, req.query.category as string));
  }
  if (req.query.startDate) {
    conditions.push(gte(expensesTable.date, req.query.startDate as string));
  }
  if (req.query.endDate) {
    conditions.push(lte(expensesTable.date, req.query.endDate as string));
  }
  if (req.query.search) {
    const search = `%${req.query.search}%`;
    conditions.push(or(ilike(expensesTable.merchant, search), ilike(expensesTable.note ?? expensesTable.note, search)) ?? eq(expensesTable.clerkUserId, userId));
  }
  if (req.query.paymentMethod) {
    conditions.push(eq(expensesTable.paymentMethod, req.query.paymentMethod as string));
  }

  const sortBy = (req.query.sortBy as string) || "date";
  const sortOrder = (req.query.sortOrder as string) || "desc";
  const limit = parseInt(req.query.limit as string) || 100;
  const offset = parseInt(req.query.offset as string) || 0;

  const orderCol = sortBy === "amount" ? expensesTable.amount : sortBy === "merchant" ? expensesTable.merchant : expensesTable.date;
  const orderFn = sortOrder === "asc" ? asc : desc;

  const [rows, countRows] = await Promise.all([
    db.select().from(expensesTable)
      .where(and(...conditions))
      .orderBy(orderFn(orderCol))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(expensesTable).where(and(...conditions)),
  ]);

  res.json({
    data: rows.map(formatExpense),
    total: Number(countRows[0].count),
  });
});

router.post("/expenses", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;
  const rows = await db.insert(expensesTable).values({
    clerkUserId: userId,
    merchant: d.merchant,
    amount: String(d.amount),
    category: d.category,
    date: d.date,
    time: d.time ?? null,
    paymentMethod: d.paymentMethod ?? null,
    reference: d.reference ?? null,
    note: d.note ?? null,
    imageUrl: d.imageUrl ?? null,
    tags: d.tags ?? null,
  }).returning();
  res.status(201).json(formatExpense(rows[0]));
});

router.get("/expenses/:id", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const rows = await db.select().from(expensesTable)
    .where(and(eq(expensesTable.id, id), eq(expensesTable.clerkUserId, userId)));
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatExpense(rows[0]));
});

router.patch("/expenses/:id", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = UpdateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;
  const updateData: Partial<typeof expensesTable.$inferInsert> = {};
  if (d.merchant !== undefined) updateData.merchant = d.merchant;
  if (d.amount !== undefined) updateData.amount = String(d.amount);
  if (d.category !== undefined) updateData.category = d.category;
  if (d.date !== undefined) updateData.date = d.date;
  if (d.time !== undefined) updateData.time = d.time;
  if (d.paymentMethod !== undefined) updateData.paymentMethod = d.paymentMethod;
  if (d.reference !== undefined) updateData.reference = d.reference;
  if (d.note !== undefined) updateData.note = d.note;
  if (d.imageUrl !== undefined) updateData.imageUrl = d.imageUrl;
  if (d.tags !== undefined) updateData.tags = d.tags;

  const rows = await db.update(expensesTable)
    .set(updateData)
    .where(and(eq(expensesTable.id, id), eq(expensesTable.clerkUserId, userId)))
    .returning();
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatExpense(rows[0]));
});

router.delete("/expenses/:id", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(expensesTable)
    .where(and(eq(expensesTable.id, id), eq(expensesTable.clerkUserId, userId)));
  res.json({ success: true });
});

export default router;

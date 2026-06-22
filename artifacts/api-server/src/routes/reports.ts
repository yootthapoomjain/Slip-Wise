import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db, expensesTable, budgetsTable } from "@workspace/db";
import { eq, and, gte, lte, sql, sum, count, desc } from "drizzle-orm";

const router = Router();

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getMonthRange(month: string) {
  const [year, mon] = month.split("-").map(Number);
  const start = `${month}-01`;
  const lastDay = new Date(year, mon, 0).getDate();
  const end = `${month}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

router.get("/reports/dashboard", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const month = (req.query.month as string) || getCurrentMonth();
  const { start: monthStart, end: monthEnd } = getMonthRange(month);
  const weekRange = getWeekRange();
  const today = getTodayStr();

  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const [todayRows, weekRows, monthRows, yearRows, budgetsRows, recentRows] = await Promise.all([
    db.select({ total: sum(expensesTable.amount) }).from(expensesTable)
      .where(and(eq(expensesTable.clerkUserId, userId), eq(expensesTable.date, today))),
    db.select({ total: sum(expensesTable.amount) }).from(expensesTable)
      .where(and(eq(expensesTable.clerkUserId, userId), gte(expensesTable.date, weekRange.start), lte(expensesTable.date, weekRange.end))),
    db.select({ total: sum(expensesTable.amount) }).from(expensesTable)
      .where(and(eq(expensesTable.clerkUserId, userId), gte(expensesTable.date, monthStart), lte(expensesTable.date, monthEnd))),
    db.select({ total: sum(expensesTable.amount) }).from(expensesTable)
      .where(and(eq(expensesTable.clerkUserId, userId), gte(expensesTable.date, yearStart), lte(expensesTable.date, yearEnd))),
    db.select({ total: sum(budgetsTable.budget) }).from(budgetsTable)
      .where(and(eq(budgetsTable.clerkUserId, userId), eq(budgetsTable.month, month))),
    db.select().from(expensesTable)
      .where(eq(expensesTable.clerkUserId, userId))
      .orderBy(desc(expensesTable.createdAt))
      .limit(10),
  ]);

  const todaySpend = parseFloat(todayRows[0]?.total ?? "0");
  const weekSpend = parseFloat(weekRows[0]?.total ?? "0");
  const monthSpend = parseFloat(monthRows[0]?.total ?? "0");
  const yearSpend = parseFloat(yearRows[0]?.total ?? "0");
  const monthBudget = parseFloat(budgetsRows[0]?.total ?? "0");
  const budgetRemaining = monthBudget - monthSpend;
  const budgetPercentage = monthBudget > 0 ? Math.min(100, (monthSpend / monthBudget) * 100) : 0;

  // Top categories this month
  const catRows = await db.select({
    category: expensesTable.category,
    total: sum(expensesTable.amount),
    cnt: count(),
  }).from(expensesTable)
    .where(and(eq(expensesTable.clerkUserId, userId), gte(expensesTable.date, monthStart), lte(expensesTable.date, monthEnd)))
    .groupBy(expensesTable.category)
    .orderBy(desc(sum(expensesTable.amount)))
    .limit(5);

  const topCategories = catRows.map(c => ({
    category: c.category,
    amount: parseFloat(c.total ?? "0"),
    count: Number(c.cnt),
    percentage: monthSpend > 0 ? (parseFloat(c.total ?? "0") / monthSpend) * 100 : 0,
    icon: null,
    color: null,
  }));

  res.json({
    todaySpend,
    weekSpend,
    monthSpend,
    yearSpend,
    monthBudget,
    budgetRemaining,
    budgetPercentage,
    recentExpenses: recentRows.map(e => ({
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
    })),
    topCategories,
  });
});

router.get("/reports/by-category", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const month = req.query.month as string | undefined;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;

  const conditions = [eq(expensesTable.clerkUserId, userId)];
  if (month) {
    const { start, end } = getMonthRange(month);
    conditions.push(gte(expensesTable.date, start));
    conditions.push(lte(expensesTable.date, end));
  } else {
    if (startDate) conditions.push(gte(expensesTable.date, startDate));
    if (endDate) conditions.push(lte(expensesTable.date, endDate));
  }

  const rows = await db.select({
    category: expensesTable.category,
    total: sum(expensesTable.amount),
    cnt: count(),
  }).from(expensesTable)
    .where(and(...conditions))
    .groupBy(expensesTable.category)
    .orderBy(desc(sum(expensesTable.amount)));

  const grandTotal = rows.reduce((acc, r) => acc + parseFloat(r.total ?? "0"), 0);

  res.json(rows.map(r => ({
    category: r.category,
    amount: parseFloat(r.total ?? "0"),
    count: Number(r.cnt),
    percentage: grandTotal > 0 ? (parseFloat(r.total ?? "0") / grandTotal) * 100 : 0,
    icon: null,
    color: null,
  })));
});

router.get("/reports/by-period", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const granularity = req.query.granularity as string;
  const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;

  const conditions = [eq(expensesTable.clerkUserId, userId)];
  if (startDate) conditions.push(gte(expensesTable.date, startDate));
  if (endDate) conditions.push(lte(expensesTable.date, endDate));

  if (!startDate && !endDate) {
    conditions.push(gte(expensesTable.date, `${year}-01-01`));
    conditions.push(lte(expensesTable.date, `${year}-12-31`));
  }

  let periodExpr: ReturnType<typeof sql>;
  if (granularity === "daily") {
    periodExpr = sql`${expensesTable.date}`;
  } else if (granularity === "weekly") {
    periodExpr = sql`TO_CHAR(TO_DATE(${expensesTable.date}, 'YYYY-MM-DD'), 'IYYY-IW')`;
  } else {
    periodExpr = sql`SUBSTRING(${expensesTable.date}, 1, 7)`;
  }

  const rows = await db.select({
    period: periodExpr,
    total: sum(expensesTable.amount),
    cnt: count(),
  }).from(expensesTable)
    .where(and(...conditions))
    .groupBy(periodExpr)
    .orderBy(periodExpr);

  res.json(rows.map(r => ({
    period: String(r.period),
    amount: parseFloat(r.total ?? "0"),
    count: Number(r.cnt),
  })));
});

router.get("/reports/top-merchants", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const month = (req.query.month as string) || getCurrentMonth();
  const limit = parseInt(req.query.limit as string) || 10;
  const { start, end } = getMonthRange(month);

  const rows = await db.select({
    merchant: expensesTable.merchant,
    total: sum(expensesTable.amount),
    cnt: count(),
  }).from(expensesTable)
    .where(and(
      eq(expensesTable.clerkUserId, userId),
      gte(expensesTable.date, start),
      lte(expensesTable.date, end),
    ))
    .groupBy(expensesTable.merchant)
    .orderBy(desc(sum(expensesTable.amount)))
    .limit(limit);

  res.json(rows.map(r => ({
    merchant: r.merchant,
    amount: parseFloat(r.total ?? "0"),
    count: Number(r.cnt),
  })));
});

export default router;

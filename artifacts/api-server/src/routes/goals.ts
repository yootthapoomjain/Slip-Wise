import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db, goalsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateGoalBody, UpdateGoalBody } from "@workspace/api-zod";

const router = Router();

function formatGoal(g: typeof goalsTable.$inferSelect) {
  return {
    id: g.id,
    clerkUserId: g.clerkUserId,
    title: g.title,
    target: parseFloat(g.target),
    current: parseFloat(g.current),
    deadline: g.deadline,
    createdAt: g.createdAt.toISOString(),
  };
}

router.get("/goals", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const rows = await db.select().from(goalsTable)
    .where(eq(goalsTable.clerkUserId, userId));
  res.json(rows.map(formatGoal));
});

router.post("/goals", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const parsed = CreateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;
  const rows = await db.insert(goalsTable).values({
    clerkUserId: userId,
    title: d.title,
    target: String(d.target),
    current: d.current ? String(d.current) : "0",
    deadline: d.deadline ?? null,
  }).returning();
  res.status(201).json(formatGoal(rows[0]));
});

router.patch("/goals/:id", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = UpdateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;
  const updateData: Partial<typeof goalsTable.$inferInsert> = {};
  if (d.title !== undefined) updateData.title = d.title;
  if (d.target !== undefined) updateData.target = String(d.target);
  if (d.current !== undefined) updateData.current = String(d.current);
  if (d.deadline !== undefined) updateData.deadline = d.deadline;

  const rows = await db.update(goalsTable)
    .set(updateData)
    .where(and(eq(goalsTable.id, id), eq(goalsTable.clerkUserId, userId)))
    .returning();
  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatGoal(rows[0]));
});

router.delete("/goals/:id", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(goalsTable)
    .where(and(eq(goalsTable.id, id), eq(goalsTable.clerkUserId, userId)));
  res.json({ success: true });
});

export default router;

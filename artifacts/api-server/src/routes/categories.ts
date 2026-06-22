import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db, categoriesTable } from "@workspace/db";
import { eq, or, isNull } from "drizzle-orm";
import { CreateCategoryBody } from "@workspace/api-zod";

const router = Router();

const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "utensils", color: "#f97316" },
  { name: "Drink", icon: "coffee", color: "#8b5cf6" },
  { name: "Coffee", icon: "cup-soda", color: "#a16207" },
  { name: "Transport", icon: "car", color: "#3b82f6" },
  { name: "Shopping", icon: "shopping-bag", color: "#ec4899" },
  { name: "Health", icon: "heart-pulse", color: "#ef4444" },
  { name: "Education", icon: "book-open", color: "#06b6d4" },
  { name: "Bills", icon: "receipt", color: "#64748b" },
  { name: "Entertainment", icon: "tv", color: "#f59e0b" },
  { name: "Travel", icon: "plane", color: "#10b981" },
  { name: "Salary", icon: "banknote", color: "#22c55e" },
  { name: "Other", icon: "circle-ellipsis", color: "#94a3b8" },
];

async function ensureDefaultCategories() {
  const existing = await db.select().from(categoriesTable).where(eq(categoriesTable.isDefault, true));
  if (existing.length === 0) {
    await db.insert(categoriesTable).values(
      DEFAULT_CATEGORIES.map(c => ({ ...c, isDefault: true, clerkUserId: null }))
    );
  }
}

router.get("/categories", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  await ensureDefaultCategories();
  const rows = await db.select().from(categoriesTable)
    .where(or(eq(categoriesTable.isDefault, true), eq(categoriesTable.clerkUserId, userId)));
  res.json(rows);
});

router.post("/categories", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;
  const rows = await db.insert(categoriesTable).values({
    name: d.name,
    icon: d.icon,
    color: d.color ?? null,
    isDefault: false,
    clerkUserId: userId,
  }).returning();
  res.status(201).json(rows[0]);
});

router.delete("/categories/:id", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(categoriesTable)
    .where(eq(categoriesTable.id, id));
  res.json({ success: true });
});

export default router;

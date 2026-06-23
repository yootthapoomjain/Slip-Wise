import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db, categoriesTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { CreateCategoryBody } from "@workspace/api-zod";

const router = Router();

const DEFAULT_CATEGORIES = [
  { name: "🍜 อาหาร", nameEn: "🍜 Food", icon: "🍜", color: "#f97316" },
  { name: "☕ เครื่องดื่ม", nameEn: "☕ Drink", icon: "☕", color: "#8b5cf6" },
  { name: "🛒 ช้อปปิ้ง", nameEn: "🛒 Shopping", icon: "🛒", color: "#ec4899" },
  { name: "🚗 เดินทาง", nameEn: "🚗 Transport", icon: "🚗", color: "#3b82f6" },
  { name: "🏠 บ้าน", nameEn: "🏠 Home", icon: "🏠", color: "#a16207" },
  { name: "💡 ค่าสาธารณูปโภค", nameEn: "💡 Utilities", icon: "💡", color: "#64748b" },
  { name: "🎮 บันเทิง", nameEn: "🎮 Entertainment", icon: "🎮", color: "#f59e0b" },
  { name: "🏥 สุขภาพ", nameEn: "🏥 Health", icon: "🏥", color: "#ef4444" },
  { name: "🎓 การศึกษา", nameEn: "🎓 Education", icon: "🎓", color: "#06b6d4" },
  { name: "💼 งาน", nameEn: "💼 Work", icon: "💼", color: "#6366f1" },
  { name: "💰 เงินเดือน", nameEn: "💰 Salary", icon: "💰", color: "#22c55e" },
  { name: "📈 การลงทุน", nameEn: "📈 Investment", icon: "📈", color: "#10b981" },
  { name: "🎁 ของขวัญ", nameEn: "🎁 Gift", icon: "🎁", color: "#e879f9" },
  { name: "📦 อื่นๆ", nameEn: "📦 Other", icon: "📦", color: "#94a3b8" },
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
    nameEn: d.nameEn ?? null,
    icon: d.icon,
    color: d.color ?? null,
    isDefault: false,
    clerkUserId: userId,
  }).returning();
  res.status(201).json(rows[0]);
});

router.put("/categories/:id", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const existing = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
  if (existing.length === 0) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  if (existing[0].isDefault || existing[0].clerkUserId !== userId) {
    res.status(403).json({ error: "Cannot modify this category" });
    return;
  }

  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;
  const rows = await db.update(categoriesTable)
    .set({ name: d.name, nameEn: d.nameEn ?? null, icon: d.icon, color: d.color ?? null })
    .where(eq(categoriesTable.id, id))
    .returning();
  res.json(rows[0]);
});

router.delete("/categories/:id", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const existing = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
  if (existing.length > 0 && (existing[0].isDefault || existing[0].clerkUserId !== userId)) {
    res.status(403).json({ error: "Cannot delete this category" });
    return;
  }

  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.json({ success: true });
});

export default router;

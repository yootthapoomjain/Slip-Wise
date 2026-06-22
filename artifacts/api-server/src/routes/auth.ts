import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpsertProfileBody } from "@workspace/api-zod";

const router = Router();

router.get("/profile", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const rows = await db.select().from(profilesTable).where(eq(profilesTable.clerkUserId, userId));
  if (rows.length === 0) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  const p = rows[0];
  res.json({
    id: p.id,
    clerkUserId: p.clerkUserId,
    name: p.name,
    email: p.email,
    avatar: p.avatar,
    currency: p.currency,
    language: p.language,
    darkMode: p.darkMode,
    createdAt: p.createdAt.toISOString(),
  });
});

router.put("/profile", requireAuth(), async (req, res): Promise<void> => {
  const userId = req.auth.userId;
  const parsed = UpsertProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;

  const existing = await db.select().from(profilesTable).where(eq(profilesTable.clerkUserId, userId));
  let profile;
  if (existing.length === 0) {
    const rows = await db.insert(profilesTable).values({
      clerkUserId: userId,
      name: data.name,
      email: data.email,
      avatar: data.avatar ?? null,
      currency: data.currency ?? "USD",
      language: data.language ?? null,
      darkMode: data.darkMode ?? true,
    }).returning();
    profile = rows[0];
  } else {
    const rows = await db.update(profilesTable)
      .set({
        name: data.name,
        email: data.email,
        avatar: data.avatar ?? existing[0].avatar,
        currency: data.currency ?? existing[0].currency,
        language: data.language ?? existing[0].language,
        darkMode: data.darkMode ?? existing[0].darkMode,
      })
      .where(eq(profilesTable.clerkUserId, userId))
      .returning();
    profile = rows[0];
  }

  res.json({
    id: profile.id,
    clerkUserId: profile.clerkUserId,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    currency: profile.currency,
    language: profile.language,
    darkMode: profile.darkMode,
    createdAt: profile.createdAt.toISOString(),
  });
});

export default router;

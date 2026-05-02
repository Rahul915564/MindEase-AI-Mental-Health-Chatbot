import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { moodEntriesTable } from "@workspace/db";
import { CreateMoodEntryBody, GetMoodEntriesQueryParams } from "@workspace/api-zod";
import { desc, eq, gte, sql } from "drizzle-orm";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
};

router.get("/mood", requireAuth, async (req: any, res) => {
  try {
    const parsed = GetMoodEntriesQueryParams.safeParse(req.query);
    const days = parsed.success ? (parsed.data.days ?? 30) : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const entries = await db
      .select()
      .from(moodEntriesTable)
      .where(
        sql`${moodEntriesTable.userId} = ${req.userId} AND ${moodEntriesTable.createdAt} >= ${since}`
      )
      .orderBy(desc(moodEntriesTable.createdAt));

    res.json(entries);
  } catch (err) {
    req.log.error({ err }, "Error fetching mood entries");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/mood", requireAuth, async (req: any, res) => {
  try {
    const body = CreateMoodEntryBody.parse(req.body);
    const [entry] = await db
      .insert(moodEntriesTable)
      .values({ userId: req.userId, mood: body.mood, note: body.note ?? null })
      .returning();
    res.status(201).json(entry);
  } catch (err) {
    req.log.error({ err }, "Error creating mood entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/mood/stats", requireAuth, async (req: any, res) => {
  try {
    const entries = await db
      .select()
      .from(moodEntriesTable)
      .where(eq(moodEntriesTable.userId, req.userId))
      .orderBy(desc(moodEntriesTable.createdAt));

    if (entries.length === 0) {
      return res.json({ averageMood: 0, totalEntries: 0, streak: 0, trend: "stable" });
    }

    const averageMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
    const totalEntries = entries.length;

    // Calculate streak (consecutive days with entries)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daySet = new Set(entries.map(e => {
      const d = new Date(e.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }));

    for (let i = 0; i <= 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (daySet.has(d.getTime())) streak++;
      else if (i > 0) break;
    }

    // Trend: compare last 7 days to previous 7 days
    let trend: "improving" | "declining" | "stable" = "stable";
    if (entries.length >= 2) {
      const recent = entries.slice(0, Math.min(7, Math.floor(entries.length / 2)));
      const older = entries.slice(Math.min(7, Math.floor(entries.length / 2)));
      const recentAvg = recent.reduce((s, e) => s + e.mood, 0) / recent.length;
      const olderAvg = older.reduce((s, e) => s + e.mood, 0) / older.length;
      if (recentAvg - olderAvg > 0.5) trend = "improving";
      else if (olderAvg - recentAvg > 0.5) trend = "declining";
    }

    res.json({ averageMood: Math.round(averageMood * 10) / 10, totalEntries, streak, trend });
  } catch (err) {
    req.log.error({ err }, "Error fetching mood stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

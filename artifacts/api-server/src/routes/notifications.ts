import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
};

router.get("/notifications", requireAuth, async (req: any, res) => {
  try {
    const items = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, req.userId))
      .orderBy(desc(notificationsTable.createdAt));
    res.json(items);
  } catch (err) {
    req.log.error({ err }, "Error fetching notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/:id/read", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [updated] = await db
      .update(notificationsTable)
      .set({ read: true })
      .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, req.userId)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error marking notification read");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/read-all", requireAuth, async (req: any, res) => {
  try {
    const result = await db
      .update(notificationsTable)
      .set({ read: true })
      .where(and(eq(notificationsTable.userId, req.userId), eq(notificationsTable.read, false)))
      .returning();
    res.json({ count: result.length });
  } catch (err) {
    req.log.error({ err }, "Error marking all notifications read");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

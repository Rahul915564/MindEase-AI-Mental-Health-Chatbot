import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { CreateConversationBody, SendOpenaiMessageBody } from "@workspace/api-zod";
import { eq, and, asc, desc } from "drizzle-orm";
import { generateResponse, simulateStream } from "./chatEngine";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
};

router.get("/openai/conversations", requireAuth, async (req: any, res) => {
  try {
    const convos = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.userId, req.userId))
      .orderBy(desc(conversationsTable.updatedAt));
    res.json(convos);
  } catch (err) {
    req.log.error({ err }, "Error fetching conversations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/openai/conversations", requireAuth, async (req: any, res) => {
  try {
    const body = CreateConversationBody.parse(req.body);
    const [convo] = await db
      .insert(conversationsTable)
      .values({ userId: req.userId, title: body.title })
      .returning();
    res.status(201).json(convo);
  } catch (err) {
    req.log.error({ err }, "Error creating conversation");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/openai/conversations/:id/messages", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [convo] = await db.select().from(conversationsTable)
      .where(and(eq(conversationsTable.id, id), eq(conversationsTable.userId, req.userId)));
    if (!convo) return res.status(404).json({ error: "Not found" });

    const msgs = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, id))
      .orderBy(asc(messagesTable.createdAt));
    res.json(msgs);
  } catch (err) {
    req.log.error({ err }, "Error fetching messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/openai/conversations/:id/messages", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [convo] = await db.select().from(conversationsTable)
      .where(and(eq(conversationsTable.id, id), eq(conversationsTable.userId, req.userId)));
    if (!convo) return res.status(404).json({ error: "Not found" });

    const body = SendOpenaiMessageBody.parse(req.body);

    await db.insert(messagesTable).values({
      conversationId: id,
      role: "user",
      content: body.content,
    });

    const botReply = generateResponse(body.content);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    simulateStream(
      botReply,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      },
      async () => {
        await db.insert(messagesTable).values({
          conversationId: id,
          role: "assistant",
          content: botReply,
        });

        await db.update(conversationsTable)
          .set({ updatedAt: new Date() })
          .where(eq(conversationsTable.id, id));

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      }
    );
  } catch (err) {
    req.log.error({ err }, "Error sending message");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { CreateConversationBody, SendOpenaiMessageBody, GetConversationMessagesParams } from "@workspace/api-zod";
import { eq, and, asc, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

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
    const conversations = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.userId, req.userId))
      .orderBy(desc(conversationsTable.updatedAt));
    res.json(conversations);
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

    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, id))
      .orderBy(asc(messagesTable.createdAt));
    res.json(messages);
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

    // Save user message
    await db.insert(messagesTable).values({
      conversationId: id,
      role: "user",
      content: body.content,
    });

    // Get conversation history
    const history = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, id))
      .orderBy(asc(messagesTable.createdAt));

    const chatMessages = [
      {
        role: "system" as const,
        content: `You are MindEase, a compassionate mental health support AI. You help users with stress, anxiety, and emotional wellbeing. Be warm, empathetic, and supportive. Offer practical coping strategies when appropriate. Always remind users that you are an AI and encourage professional help for serious concerns. You can respond in both Hindi and English based on what language the user writes in.`,
      },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";
    const stream = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save assistant message
    await db.insert(messagesTable).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    // Update conversation updatedAt
    await db.update(conversationsTable)
      .set({ updatedAt: new Date() })
      .where(eq(conversationsTable.id, id));

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Error sending message");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const moodEntriesTable = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  mood: integer("mood").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMoodEntrySchema = createInsertSchema(moodEntriesTable).omit({ id: true, createdAt: true });
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type MoodEntry = typeof moodEntriesTable.$inferSelect;

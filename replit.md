# MindEase — Mental Health AI Chatbot

## Overview

A full-stack mental health AI chatbot web app with AI-powered chat, breathing exercises, mood tracking, bilingual support, dark mode, and notifications.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/mindease), served at `/`
- **API framework**: Express 5 (artifacts/api-server), served at `/api`
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: Clerk (whitelabel, managed by Replit)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.4 streaming chat)
- **Build**: esbuild (CJS bundle for API), Vite (frontend)

## Features

- Login/Register via Clerk auth
- AI chat (streaming SSE) with mental health companion persona
- 4 animated breathing exercises (Box, 4-7-8, Belly, Alternate Nostril) with framer-motion
- Mood tracker with recharts LineChart
- Hindi/English language toggle (LanguageProvider with localStorage)
- Dark mode (next-themes ThemeProvider)
- Notifications panel

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## DB Tables

- `conversations` — AI chat sessions (userId, title)
- `messages` — Chat messages (conversationId, role, content)
- `mood_entries` — Mood logs (userId, mood 1-10, note)
- `notifications` — User notifications (userId, title, body, type, read)

## Pages

- `/` — Landing page (signed-out) / redirect to dashboard (signed-in)
- `/sign-in`, `/sign-up` — Clerk auth pages (themed)
- `/dashboard` — User hub with quick mood log, stats, recent chat
- `/chat` — Conversations list
- `/chat/:id` — AI chat interface with streaming responses
- `/breathing` — 4 animated breathing exercises
- `/mood` — Mood tracker with history graph
- `/notifications` — Notifications panel
- `/settings` — Language toggle, dark mode, profile

## API Routes

- `GET /api/healthz` — health check
- `GET/POST /api/mood` — mood entries
- `GET /api/mood/stats` — mood statistics
- `GET/PATCH /api/notifications` — notifications
- `PATCH /api/notifications/read-all` — mark all read
- `GET/POST /api/openai/conversations` — conversations
- `GET /api/openai/conversations/:id/messages` — messages
- `POST /api/openai/conversations/:id/messages` — send message (SSE stream)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

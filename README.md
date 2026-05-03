# 🧠 MindEase — AI Mental Health Chatbot

<div align="center">

![MindEase Banner](https://img.shields.io/badge/MindEase-Mental%20Health%20AI-6C63FF?style=for-the-badge&logo=brain&logoColor=white)

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Click_Here-success?style=for-the-badge)](https://mind-ease-bot--rktetari1111.replit.app)
[![Built with Replit](https://img.shields.io/badge/Built_with-Replit-F26207?style=for-the-badge&logo=replit&logoColor=white)](https://replit.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-95%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

> **🏆 Built for Replit 10 Year Buildathon — May 2026**

*"Mental health support, available 24/7 — in English and Hindi"*

</div>

---

## 🌟 The Problem

**1 in 5 people** struggle with mental health issues, yet most cannot access therapy due to cost, stigma, or unavailability. In India alone, there is only **1 psychiatrist per 400,000 people**.

MindEase bridges this gap — a compassionate AI companion that's always available, always judgment-free, and speaks your language.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat (Streaming)** | Real-time empathetic responses via GPT with SSE streaming |
| 🌐 **Bilingual Support** | Full Hindi + English language toggle |
| 🌬️ **Breathing Exercises** | 4 animated techniques: Box, 4-7-8, Belly, Alternate Nostril |
| 📊 **Mood Tracker** | Log moods (1–10) with history graph powered by Recharts |
| 🔐 **Auth (Clerk)** | Secure Sign Up / Sign In with Google OAuth support |
| 🌙 **Dark Mode** | Smooth theme toggle with next-themes |
| 🔔 **Notifications** | Personal notification panel per user |
| 💾 **Persistent History** | All conversations & moods saved per user in PostgreSQL |

---

## 🎥 Demo

🔗 **Live App:** [https://mind-ease-bot--rktetari1111.replit.app](https://mind-ease-bot--rktetari1111.replit.app)

> _(Add screenshots or a GIF here — even one screenshot makes a huge difference!)_

```
📸 Tip: Add 2-3 screenshots of your app in a /screenshots folder
and embed them like: ![Dashboard](./screenshots/dashboard.png)
```

---

## 🛠️ Tech Stack

```
Frontend          →  React + Vite + TypeScript + Framer Motion
Backend           →  Express 5 + TypeScript
Database          →  PostgreSQL + Drizzle ORM
Auth              →  Clerk (Email + Google OAuth)
AI                →  OpenAI GPT (Streaming via SSE)
Charts            →  Recharts
Styling           →  CSS + Dark Mode (next-themes)
Monorepo          →  pnpm workspaces
Deployment        →  Replit
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- PostgreSQL database
- Clerk account (free)
- OpenAI API key

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/Rahul915564/MindEase-AI-Mental-Health-Chatbot.git
cd MindEase-AI-Mental-Health-Chatbot

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your keys (see below)

# 4. Push database schema
pnpm --filter @workspace/db run push

# 5. Start development
pnpm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/mindease

# Clerk Auth
CLERK_SECRET_KEY=sk_...
VITE_CLERK_PUBLISHABLE_KEY=pk_...

# OpenAI
OPENAI_API_KEY=sk-...
```

---

## 📁 Project Structure

```
MindEase-AI-Mental-Health-Chatbot/
├── artifacts/
│   ├── mindease/          # React frontend (Vite)
│   └── api-server/        # Express backend
├── lib/
│   ├── db/                # PostgreSQL + Drizzle ORM schema
│   └── api-spec/          # OpenAPI spec + Orval codegen
├── scripts/               # Utility scripts
└── pnpm-workspace.yaml
```

---

## 🗄️ Database Schema

| Table | Description |
|---|---|
| `conversations` | AI chat sessions per user |
| `messages` | Individual chat messages |
| `mood_entries` | Mood logs (1–10 scale + notes) |
| `notifications` | User notifications |

---

## 🌐 API Endpoints

```
GET  /api/healthz                              → Health check
GET  /api/mood                                 → Get mood entries
POST /api/mood                                 → Log new mood
GET  /api/mood/stats                           → Mood statistics
GET  /api/openai/conversations                 → List conversations
POST /api/openai/conversations                 → Create conversation
GET  /api/openai/conversations/:id/messages    → Get messages
POST /api/openai/conversations/:id/messages    → Send message (SSE stream)
GET  /api/notifications                        → Get notifications
PATCH /api/notifications/read-all              → Mark all read
```

---

## 🏗️ App Pages

| Route | Page |
|---|---|
| `/` | Landing (signed-out) / Dashboard redirect (signed-in) |
| `/sign-in` `/sign-up` | Clerk auth pages (themed) |
| `/dashboard` | User hub — quick mood log, stats, recent chat |
| `/chat` | Conversations list |
| `/chat/:id` | AI chat with streaming responses |
| `/breathing` | 4 animated breathing exercises |
| `/mood` | Mood tracker with history graph |
| `/notifications` | Notifications panel |
| `/settings` | Language, dark mode, profile |

---

## 🧪 Key Commands

```bash
pnpm run typecheck          # Full typecheck across all packages
pnpm run build              # Typecheck + build all packages
pnpm --filter @workspace/db run push   # Push DB schema (dev only)
```

---

## 🌍 Why MindEase?

- 🆓 **Free to use** — no paywalls for mental health support
- 🗣️ **Hindi + English** — accessible to 500M+ Hindi speakers
- 🔒 **Private** — your conversations are yours only
- ⚡ **Always available** — 3 AM panic attack? We're here.
- 🧘 **Holistic** — chat + breathing + mood tracking together

---

## 🔮 Roadmap

- [ ] Voice input/output (speak your feelings)
- [ ] Crisis detection with helpline suggestions
- [ ] Weekly mental health PDF reports
- [ ] Therapist referral integration
- [ ] Mobile app (React Native)
- [ ] More languages (Tamil, Bengali, Marathi)

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork → Clone → Create branch → Make changes → PR
git checkout -b feature/your-feature-name
```

---

## ⚠️ Disclaimer

MindEase is an AI assistant and **not a substitute for professional mental health care**. If you are in crisis, please contact a mental health professional or crisis helpline immediately.

**India iCall:** 9152987821 | **Vandrevala Foundation:** 1860-2662-345

---

## 👨‍💻 Author

**Rahul** — [@Rahul915564](https://github.com/Rahul915564)

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

Made with ❤️ for the **Replit 10 Year Buildathon**

*If this project helped you, please give it a ⭐*

</div>

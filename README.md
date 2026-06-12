# Budget Boss

> An AI-powered personal expense tracker with a built-in chat assistant that manages your spending through natural language — backed by a Model Context Protocol (MCP) server.

<p align="center">
  <a href="https://budget-bosss.vercel.app"><strong>Live Demo → budget-bosss.vercel.app</strong></a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" />
  <img alt="Postgres" src="https://img.shields.io/badge/Neon-Postgres-00e599?logo=postgresql" />
  <img alt="Drizzle" src="https://img.shields.io/badge/Drizzle-ORM-c5f74f" />
  <img alt="Deployed on Vercel" src="https://img.shields.io/badge/Vercel-deployed-black?logo=vercel" />
</p>

---

## Overview

Budget Boss is a full-stack expense management app where you can log expenses the
traditional way (forms, tables, dashboards) **or** just talk to an AI assistant:

> _"I spent ₹450 on lunch yesterday"_ — and it's logged.
> _"How much did I spend on food last month?"_ — and you get a real answer from your data.

The assistant doesn't hallucinate numbers. It drives a set of **MCP tools** that
read and write your actual expense data, so every answer and every change is
grounded in the database.

---

## Features

### Core
- **Dashboard** — monthly spend, category breakdown, and spending-trend charts (Recharts).
- **Expense management** — full CRUD with search, category filters, and inline editing.
- **Categories** — seven sensible defaults seeded per user, fully customizable with colors.
- **Light / dark / system theme**, smooth Framer Motion transitions, and a responsive, mobile-friendly layout.

### AI Assistant
- **Conversational expense management** — add, edit, delete, and summarize expenses in plain language.
- **Grounded in your data** — the assistant calls MCP tools rather than guessing; it never invents expense data.
- **Timezone & currency aware** — "today" and "last month" are computed in *your* local time, amounts in *your* currency.
- **Chat history** — past conversations are saved as selectable sessions.
- **Rate limiting** — burst (5 msgs / 30s) and daily (25 msgs/day on the shared key) limits, enforced at the Postgres layer.

### Bring Your Own Key (BYOK)
- Use the app's shared "house key" **or** plug in your own provider key.
- **Provider-agnostic** via the Vercel AI SDK — choose **Anthropic (Claude)**, **Google (Gemini)**, or **Groq (Llama)** and a specific model.
- User keys are **AES-256-GCM encrypted at rest** and never returned to the client after saving.
- BYOK users skip the daily house-key limit (they pay for their own usage).

### MCP Integration
- The in-app chat connects to a companion **et-mcp** server using short-lived, identity-only JWTs (service-to-service).
- **External MCP clients** (e.g. Claude Desktop) can connect using long-lived `etmcp_` API keys minted in **Settings → API Keys**.

### Auth & Accounts
- **NextAuth v5** with **Google OAuth** and **email/password** (bcrypt) credentials.
- JWT sessions, Drizzle adapter, route protection via Next.js 16 `proxy`.

---

## Tech Stack

| Layer        | Technology                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| Framework    | [Next.js 16](https://nextjs.org) (App Router) · React 19 · TypeScript 5    |
| Styling      | Tailwind CSS v4 · [shadcn/ui](https://ui.shadcn.com) · Base UI · Lucide    |
| Charts / UX  | Recharts · Framer Motion · next-themes                                      |
| Auth         | NextAuth v5 (Google + Credentials) · `@auth/drizzle-adapter` · bcryptjs    |
| Database     | [Neon](https://neon.tech) serverless Postgres · Drizzle ORM / Kit          |
| AI           | Vercel AI SDK (`ai`) · `@ai-sdk/anthropic` · `@ai-sdk/google` · `@ai-sdk/groq` |
| MCP          | `@ai-sdk/mcp` · `jose` (JWT) · companion `et-mcp` server                    |
| Hosting      | [Vercel](https://vercel.com)                                               |

---

## Getting Started

### Prerequisites
- **Node.js 20+**
- A **Neon** (or any) Postgres database
- At least one AI provider key (a free **Google Gemini** key works great to start)

### 1. Clone & install

```bash
git clone https://github.com/lllmavlll/ai-powered-expense-tracker-with-mcp.git
cd ai-powered-expense-tracker-with-mcp/expense-tracker
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```dotenv
# ── Database (Neon — console.neon.tech) ──────────────────────────────
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# ── Auth (NextAuth) ──────────────────────────────────────────────────
AUTH_SECRET=               # generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3500

# Optional: Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ── MCP server (in-app chat → et-mcp, service-to-service) ────────────
MCP_URL=                   # URL of the et-mcp server
MCP_INTERNAL_JWT_SECRET=   # shared secret with et-mcp; openssl rand -base64 32

# ── Chat AI model (house key, provider-agnostic) ─────────────────────
# AI_PROVIDER: anthropic | google | groq   ·   AI_MODEL: optional override
AI_PROVIDER=google
# AI_MODEL=

# Only the active provider's key is required:
GOOGLE_GENERATIVE_AI_API_KEY=   # free tier: aistudio.google.com/apikey
# ANTHROPIC_API_KEY=            # console.anthropic.com (starts with sk-ant-)
# GROQ_API_KEY=                 # console.groq.com (starts with gsk_)

# ── BYOK (per-user keys) ─────────────────────────────────────────────
# Master key used to AES-256-GCM encrypt users' own provider keys at rest.
BYOK_ENCRYPTION_KEY=       # openssl rand -base64 32 (must decode to 32 bytes)
```

### 3. Set up the database

```bash
npm run db:push      # apply the Drizzle schema to your database
npm run db:studio    # (optional) open Drizzle Studio to browse data
```

### 4. Run the dev server

```bash
npm run dev
```

Open **[http://localhost:3500](http://localhost:3500)** and create an account.

---

## Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start the dev server on port **3500**        |
| `npm run build`    | Production build                             |
| `npm run start`    | Start the production server                  |
| `npm run lint`     | Run ESLint                                   |
| `npm run db:push`  | Push the Drizzle schema to the database      |
| `npm run db:studio`| Open Drizzle Studio                          |

---

## Project Structure

```
expense-tracker/
├── app/
│   ├── (app)/                 # Authenticated app shell
│   │   ├── dashboard/         # Charts & summaries
│   │   ├── expenses/          # Expense table + CRUD dialogs
│   │   └── settings/          # Profile, preferences, BYOK, API keys
│   ├── (auth)/login/          # Login / register
│   └── api/                   # Route handlers (chat, expenses, user, auth…)
├── components/
│   ├── chat/                  # Chat input, bubbles, history
│   ├── dashboard/             # Summary cards, spending chart
│   ├── expenses/              # Table, filters, dialogs, chat FAB
│   ├── settings/              # Profile, preferences, BYOK, API keys
│   ├── layout/                # Sidebar, chat panel, timezone sync
│   └── ui/                    # shadcn / Base UI primitives
├── lib/
│   ├── db/                    # Drizzle client + schema (auth, expenses, chat, ai-keys, mcp)
│   ├── ai-model.ts            # Provider-agnostic chat model resolution
│   ├── ai-catalog.ts          # Curated, tool-capable BYOK models
│   ├── byok.ts · crypto.ts    # Per-user key handling + AES-256-GCM
│   ├── mcp-jwt.ts · mcp-keys.ts  # Internal JWTs + external API keys
│   └── rate-limit.ts          # Postgres-based burst/daily limits
├── auth.ts                    # NextAuth v5 configuration
└── proxy.ts                   # Next.js 16 route protection (formerly middleware)
```

---

## Security Notes

- Passwords are hashed with **bcrypt**; provider keys are **AES-256-GCM** encrypted at rest.
- The in-app chat authenticates to et-mcp with **2-minute, identity-only JWTs** — no secrets travel in tokens.
- External MCP API keys are stored **hashed (SHA-256)**, shown once on creation, and revocable.
- All API routes enforce authentication and scope every query to the signed-in user.

---

## Deployment (Vercel)

This app is deployed on **Vercel** at **[budget-bosss.vercel.app](https://budget-bosss.vercel.app)**.

1. Import the repo into Vercel.
2. Add **all environment variables** from the [`.env`](#2-configure-environment) section to your Vercel project (set `NEXTAUTH_URL` to your production URL).
3. Ensure the database schema is applied (`npm run db:push` against your production database).
4. Deploy — Vercel builds and serves the Next.js app automatically.

> **Note:** The companion **et-mcp** server is deployed separately. Point `MCP_URL` at it and share the same `MCP_INTERNAL_JWT_SECRET` between both services.

---

## Contributing

Contributions are welcome! Open an issue to discuss a change, or submit a PR
against the `develop` branch.

---

## License

This project is provided as-is for personal and educational use.

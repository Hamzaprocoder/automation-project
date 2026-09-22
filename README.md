# Automation Project

Production-minded multi-tenant CRM platform for small local businesses that use WhatsApp as their primary customer communication channel.

## Project Status

**Current phase:** Phase 0 — Architecture & MVP Definition  
**Next phase:** Phase 1 — Project Setup

## Stack

- Next.js frontend
- Express API
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- TypeScript
- pnpm workspaces
- Official Meta WhatsApp Cloud API (integration in later phase)
- n8n (automation in later phase)
- OpenAI (AI assist in later phase)

## Structure

```text
apps/
  web/        Next.js application
  api/        Express API
packages/
  db/         Prisma schema and database client
docs/
  PHASE-0.md  Product architecture and MVP definition
```

## Getting started

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with `docker compose up -d db`.
3. Install dependencies with `pnpm install`.
4. Generate Prisma Client with `pnpm db:generate`.
5. Run migrations with `pnpm db:migrate`.
6. Start the web and API apps with `pnpm dev`.

## Development Rule

Development follows the documented phase order. Each phase ends with working, tested code and a Git commit. We do not jump ahead.

See [docs/PHASE-0.md](./docs/PHASE-0.md) for the complete product architecture, MVP scope, RBAC, multi-tenancy, security model, and development sequence.

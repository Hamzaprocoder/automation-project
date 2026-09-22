# Automation Project

Monorepo scaffold for the automation/CRM platform.

## Stack

- Next.js frontend
- Express API
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- TypeScript
- pnpm workspaces

## Structure

```
apps/
  web/        Next.js application
  api/        Express API
packages/
  db/         Prisma schema and database client
```

## Getting started

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with `docker compose up -d db`.
3. Install dependencies with `pnpm install`.
4. Generate Prisma Client with `pnpm db:generate`.
5. Run migrations with `pnpm db:migrate`.
6. Start the web and API apps with `pnpm dev`.

The Phase 1 scaffold intentionally keeps product/domain behavior minimal so later phases can add the documented modules without coupling the foundation to assumptions.

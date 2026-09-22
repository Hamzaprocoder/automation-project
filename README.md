# WhatsApp Local Business CRM & Automation Platform

A production-minded, multi-tenant SaaS CRM foundation for local businesses that use WhatsApp as a primary customer communication channel.

The project demonstrates full-stack TypeScript engineering across tenant isolation, RBAC, customer CRM, WhatsApp Cloud API integration, appointments, orders, analytics, notifications, audit logging, automation readiness, testing, and deployment preparation.

## Problem

Local businesses often manage customer conversations, appointments, sales, and follow-ups across WhatsApp, spreadsheets, and disconnected tools. This creates missed conversations, weak customer history, and limited visibility into business activity.

## Solution

A centralized CRM backend that connects customers, WhatsApp conversations, appointments, services, orders, analytics, notifications, and audit history under an organization-scoped security model.

## Current Status

**Portfolio status:** Phase 19 — portfolio packaging complete.

The repository contains the backend and deployment foundation. The Next.js frontend is currently a scaffold, and Phase 12 AI functionality was intentionally skipped in the implementation sequence. AI and advanced automation are therefore documented as future extensions rather than claimed as implemented features.

Production deployment configuration is prepared, but a live Vercel/Railway deployment is not claimed until the services are actually provisioned and verified.

## Key Features

- **Multi-tenant SaaS architecture** with organization-scoped data access
- **RBAC** with Owner, Admin, Manager, and Staff roles
- **Secure authentication** using bcrypt password hashing and HTTP-only JWT cookies
- **Customer CRM** with search, filtering, soft deletion, interaction metrics, and lifetime order metrics
- **WhatsApp Cloud API** webhook handling, signature verification, inbound messages, outbound messaging, and idempotency
- **Conversation inbox APIs** with status, assignment, unread state, notes, and message history
- **Appointments & Services** with staff/customer/service relationships and status workflows
- **Orders & Payments** with totals, completion tracking, and customer lifetime metrics
- **Dashboard & Analytics** with tenant-scoped KPIs and time series
- **Notifications** with unread counts and read state
- **Audit logs** for important business and authentication actions
- **n8n automation readiness** through authenticated automation endpoints
- **Automated API tests** for authentication and tenant isolation
- **Deployment preparation** for Railway/Render/Fly.io + managed PostgreSQL and Vercel

## Architecture

```text
                    Internet
                       |
              +--------+--------+
              |                 |
        Next.js Web        Express API
        (Vercel)          (Railway/etc.)
                              |
          +-------------------+-------------------+
          |                   |                   |
      PostgreSQL       Meta WhatsApp API       n8n
       + Prisma        webhooks/messaging    workflows
```

The API is the business boundary. Authenticated requests carry an organization context, and business queries are scoped by `organizationId`. Membership and role checks are enforced server-side.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma |
| Authentication | bcryptjs, JWT, HTTP-only cookies |
| Validation | Zod |
| WhatsApp | Official Meta WhatsApp Cloud API |
| Security | Helmet, CORS, signed webhook verification, tenant/RBAC checks |
| Testing | Jest, Supertest |
| Automation | n8n integration endpoints |
| Deployment target | Vercel + Railway/Render/Fly.io |

## Project Structure

```text
apps/
  web/                  Next.js frontend
  api/                  Express REST API
    src/
      modules/          auth, customers, conversations, appointments, orders, etc.
      middleware/       auth, RBAC, automation security
      lib/              Prisma, config, authentication helpers
      test/             test application and setup
packages/
  db/                   Prisma schema, migrations, generated client
docs/
  PHASE-*.md            implementation and architecture notes
```

## API Overview

Main route groups include:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/customers`
- `GET /api/conversations`
- `POST /api/conversations/:id/messages`
- `GET /api/appointments`
- `GET /api/orders`
- `GET /api/dashboard`
- `GET /api/analytics/overview`
- `GET /api/notifications`
- `GET /api/audit-logs`
- `GET /api/automations/upcoming-appointments`
- `GET /api/webhooks/whatsapp`
- `POST /api/webhooks/whatsapp`

Route availability should be checked against the current implementation and environment configuration before integrating an external client.

## Local Development

### Prerequisites

- Node.js 18+
- pnpm 10+
- PostgreSQL, or Docker for the local database

### Setup

```bash
git clone https://github.com/Hamzaprocoder/automation-project.git
cd automation-project

cp .env.example .env
# Configure DATABASE_URL, JWT_SECRET and other required variables.

pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

The web app runs on the Next.js development server and the API on port 4000 by default.

### Testing

```bash
pnpm --filter @automation/api test
```

The API test suite currently covers authentication and organization tenant isolation. Tests require a configured PostgreSQL database; use a dedicated test database rather than a production database.

### Production build

```bash
pnpm db:generate
pnpm build
```

The API provides production scripts for `start`, `prisma migrate deploy`, and Prisma client generation.

## Deployment

The repository is prepared for:

- **Frontend:** Vercel
- **Backend:** Railway, Render, or Fly.io
- **Database:** Railway PostgreSQL, Neon, Supabase, or another managed PostgreSQL provider

For deployment, configure production secrets outside Git, run Prisma migrations with `prisma migrate deploy`, and set the frontend `NEXT_PUBLIC_API_URL` to the public API URL.

See `docs/PHASE-18.md` for the deployment checklist.

## Security Highlights

- bcrypt password hashing
- HTTP-only session cookies
- Secure cookies in production
- JWT authentication with server-side membership revalidation
- Organization-scoped database queries
- Role-based authorization
- Zod request validation
- Meta webhook HMAC signature verification
- Helmet and CORS hardening
- Audit logging for important actions
- No secrets committed to the repository

## Engineering Decisions

- The backend owns business rules; n8n is treated as an external automation layer.
- WhatsApp integration uses the official Meta Cloud API rather than scraping.
- Tenant identity comes from authenticated server context rather than client-provided organization IDs.
- AI was planned as an assistive layer with human review, but the AI module was intentionally skipped in this implementation sequence.
- Production deployment is documented separately from verified live infrastructure so the repository does not overstate its deployment status.

## What This Project Demonstrates

- Multi-tenant SaaS architecture
- Modular Express/TypeScript backend design
- Prisma/PostgreSQL data modeling
- Authentication and RBAC
- Third-party API/webhook integration
- Tenant isolation and auditability
- Automated API testing
- Deployment-oriented engineering
- Product-oriented domain modeling

## Future Extensions

- Complete production frontend UI
- AI conversation assistance
- Advanced n8n workflows
- Billing and subscriptions
- Richer analytics and reporting
- Email/SMS notifications
- Advanced search and segmentation
- Mobile-responsive workflow optimization
- Observability with Sentry or equivalent

## License

MIT, if you choose to publish the project under the MIT License. Add a LICENSE file before making that legal designation.

## Portfolio Materials

- `docs/PORTFOLIO.md` — CV and LinkedIn copy
- `docs/DEMO-SCRIPT.md` — interview/client demo flow
- `docs/PHASE-18.md` — deployment preparation

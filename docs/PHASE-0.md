# Phase 0 — Complete Product Architecture & MVP Definition

## Objective

Define a clear, realistic, production-minded blueprint before application code is written.

By the end of Phase 0 we define:
- What the product does and deliberately does not do in the MVP.
- User roles and permissions.
- Multi-tenant data isolation.
- Conceptual database entities and relationships.
- Major system communication paths.
- Non-negotiable security rules.
- The exact development sequence.

**Phase 0 contains design only. No application code is introduced.**

## 1. Problem We Are Solving

Small local businesses such as salons, clinics, tuition centers, repair shops, and real-estate agents commonly use WhatsApp as their primary customer communication channel.

Current pain points include:
- Customer messages arriving at random times and being lost.
- No reliable record of what a customer requested.
- Missed follow-ups.
- Missing appointment reminders.
- No consistent history of visits or spending.
- Staff not knowing which conversation belongs to which customer.
- Repeated manual copy/paste of common messages.

The product becomes the **central system of record**. WhatsApp remains the conversation channel while the CRM owns business data and logic: customers, conversations, appointments, follow-ups, staff, and analytics.

## 2. MVP Definition

The MVP is the smallest version that a real local business can use and derive value from.

### MVP must include

1. Business owner registration and organization creation.
2. Staff invitations with different roles.
3. Official Meta WhatsApp Cloud API integration for incoming messages.
4. Automatic customer and conversation creation/update from incoming WhatsApp messages.
5. Staff inbox with message replies and customer profile access.
6. Appointment creation and management linked to customers.
7. Customer list, search, profile, and simple timeline.
8. Dashboard with:
   - Today's appointments
   - Unanswered conversations
   - Overdue follow-ups
   - New customers
9. Login/logout and server-enforced tenant security so one business cannot access another business's data.

### Explicitly out of MVP

- Advanced AI features.
- Complex n8n automations beyond basic reminders.
- Full order/payment system.
- Dynamic customer segmentation.
- Email notifications.
- Advanced analytics charts.
- Billing/subscription system.
- Multi-organization switching for the same user.

The MVP remains focused and demonstrable to a real salon or clinic owner.

## 3. User Roles — RBAC

Four roles exist inside each organization.

| Role | Who it is for | Permissions |
|---|---|---|
| Owner | Business owner | Everything; organization lifecycle, settings, members, and all data. Billing will be added later. |
| Admin | Trusted manager | Almost everything except deleting the organization or changing ownership. |
| Manager | Senior staff / supervisor | Manage customers, appointments, conversations, assignments, and reports. Cannot change organization settings or roles. |
| Staff | Front-line employee | View/reply to assigned or unassigned conversations, create appointments, update customer notes, and complete own tasks. Limited visibility. |

A user may belong to multiple organizations in the long-term architecture, but the MVP keeps the active working context simple: one primary organization at a time.

### RBAC rule

The backend checks the authenticated user's role on **every protected request**. Frontend visibility is only a UX convenience; it is never the security boundary.

## 4. Multi-Tenancy

Multi-tenancy means one application serves many businesses while their data remains completely isolated.

Mental model:
- SaaS platform = apartment building.
- Organization = apartment.
- Organization members = people with keys to that apartment.
- Data belonging to Organization A must never be readable or writable by Organization B.

### Enforcement strategy

- Almost every business table includes `organizationId`.
- Authentication establishes the user's organization context.
- Every tenant-scoped query includes the current `organizationId`.
- Authorization verifies organization membership before access.
- Cross-tenant object access must return no data or an appropriate `403 Forbidden`.
- Tenant isolation is enforced on the backend/database access layer, never only in the UI.

## 5. High-Level System Architecture

```text
User Browser (Next.js Frontend)
        |
        | HTTPS + HTTP-only cookies
        v
Express API (Backend)
        |
        +-- Authentication & Session
        +-- Role & Tenant checks
        +-- Business logic
        |
        +-- PostgreSQL (via Prisma)
        +-- Official WhatsApp Cloud API (Meta)
        +-- n8n (scheduled automations, later)
        +-- OpenAI (assistive features, later)
```

### Main communication paths

#### A. Staff using the CRM

```text
Browser -> Next.js -> Express API -> PostgreSQL
```

#### B. Incoming WhatsApp message

```text
Customer
   -> WhatsApp
   -> Meta servers
   -> Backend webhook
   -> Signature verification
   -> Find/create Customer
   -> Find/create Conversation
   -> Save Message
   -> Notify/update inbox
```

#### C. Later n8n automation

```text
n8n trigger
   -> CRM API
   -> Business-rule checks
   -> WhatsApp template or CRM task
   -> Result logged in CRM
   -> Failure creates an owner/admin notification
```

Core business rules remain in the backend. n8n is an orchestration layer for scheduling, retries, and external integrations.

## 6. Conceptual Database ERD

### Core identity

- **User** — any person who can authenticate.
- **Organization** — one business/tenant.
- **OrganizationMember** — joins a user to an organization and stores their role.

### Customer and communication

- **Customer** — belongs to one organization.
- **Tag** — organization-scoped customer label.
- **CustomerTag** — many-to-many relationship between Customer and Tag.
- **Conversation** — belongs to a Customer.
- **Message** — belongs to a Conversation.

### Business operations

- **Service** — a business offering.
- **Inquiry** — potential lead or customer request.
- **Appointment** — linked to Customer, Service, and staff member.
- **Order** — later-phase sales record.
- **OrderItem** — later-phase order detail.
- **Payment** — later-phase payment record.
- **Task / FollowUp** — work requiring staff attention.
- **MessageTemplate** — reusable messaging template.
- **Notification** — in-app notification.
- **AuditLog** — record of important actions.

### Database rules

- Tenant/business tables carry `organizationId`.
- Historical records use soft deletion where appropriate via `deletedAt`.
- Frequently filtered fields receive appropriate indexes.
- Composite uniqueness is tenant-scoped where required.
- Example: the same normalized phone number cannot create two active Customer records inside one organization.

## 7. Official WhatsApp Architecture

Only the **official Meta WhatsApp Business Platform / Cloud API** is used.

### Incoming message flow

```text
Customer -> WhatsApp -> Meta
                    |
                    v
             Backend webhook
                    |
                    v
          Verify Meta signature
                    |
                    v
      Find/create Customer by phone
                    |
                    v
        Find/create Conversation
                    |
                    v
             Save Message
                    |
                    v
       Optional Inquiry / notification
                    |
                    v
             Frontend Inbox
```

### Operational constraints

- Free-form customer-service messages are limited by the applicable WhatsApp customer-service window.
- Outside that window, approved message templates are required where applicable.
- Opt-in/consent requirements must be respected.
- No unofficial WhatsApp Web scraping or libraries that violate Meta terms will be used.

## 8. n8n Automation Architecture — Later

n8n remains outside the core application.

Typical workflow:

```text
Trigger (Cron/Webhook)
    -> Get data from CRM API
    -> Check business conditions
    -> Check customer consent where required
    -> Send approved WhatsApp template or create CRM Task
    -> Log result
    -> On failure: create Owner/Admin notification
```

Business rules stay in the backend; n8n handles scheduling, orchestration, retries, and external service connections.

## 9. AI Architecture — Later

AI is an **assistant**, never the autonomous decision maker.

Potential assistive features:
- Summarize long conversations.
- Suggest replies for staff review.
- Classify an incoming message.
- Generate a short customer summary.

Anything that leaves the system, especially a customer-facing message, requires human review in the planned AI-assist phase.

## 10. Security Model — Non-Negotiable

These rules apply from Phase 1 onward:

1. Passwords are never stored in plaintext; use a strong password-hashing algorithm.
2. Sessions use secure, HTTP-only cookies.
3. Every protected API request validates:
   - authenticated session,
   - organization membership/context,
   - required role/permission.
4. Secrets such as database URLs and external API credentials exist only in environment variables/secret management.
5. Incoming WhatsApp webhooks validate the Meta signature.
6. Tenant-scoped queries can never return another organization's data.
7. Server-side validation is mandatory; the frontend is untrusted.
8. Important security/business actions are written to an AuditLog.
9. Sensitive data is not unnecessarily exposed in API responses.
10. Security-sensitive failures should not leak cross-tenant information.

## 11. Development Phases — Fixed Order

Each phase ends with working, tested code and a Git commit.

| Phase | Name | Goal |
|---:|---|---|
| 0 | Architecture & MVP | Product blueprint and scope |
| 1 | Project Setup | Monorepo, Next.js, Express, Prisma, PostgreSQL, Tailwind |
| 2 | Database Schema | Core models, migrations, relationships |
| 3 | Authentication | Register, login, logout, sessions, organization creation |
| 4 | RBAC + Multi-tenancy | Roles and hard tenant isolation |
| 5 | Customer CRM | List, create, profile, search, tags, timeline |
| 6 | Dashboard | Real KPIs + Attention Required |
| 7 | WhatsApp Integration | Official webhook + message storage |
| 8 | WhatsApp Inbox | Full conversation UI |
| 9 | Appointments | Services, booking, status flow |
| 10 | Orders | Basic sales tracking |
| 11 | n8n Automations | Reminders and follow-ups |
| 12 | AI Assist | Summaries and suggestions |
| 13 | Analytics | Real business metrics |
| 14 | Notifications | In-app notifications; email later |
| 15 | Audit Logs | Who did what |
| 16 | Testing | Unit, integration, and tenant-isolation tests |
| 17 | Security Review | Production hardening |
| 18 | Deployment | Production deployment |
| 19 | Portfolio Package | README, demos, documentation |

### Phase-gate rule

We do not jump ahead. A phase is considered complete only after its acceptance criteria, tests, and Git commit are complete.

## 12. Phase 0 Acceptance Criteria

- [x] Product problem is defined.
- [x] MVP scope is defined.
- [x] Out-of-scope features are documented.
- [x] RBAC roles are defined.
- [x] Multi-tenancy strategy is defined.
- [x] High-level architecture is defined.
- [x] Conceptual database entities are defined.
- [x] Official WhatsApp architecture is defined.
- [x] n8n and AI boundaries are defined.
- [x] Security rules are documented.
- [x] Development order is fixed.

**Status: Phase 0 — Approved / Ready for Phase 1**

# Phase 2 — Database Schema

## Goal

Build the production-oriented PostgreSQL/Prisma data model for the multi-tenant WhatsApp CRM.

## Included

- Organizations and organization memberships with Owner/Admin/Manager/Staff roles
- Staff invitations
- Tenant-scoped customers, tags, conversations, and messages
- WhatsApp message direction/status/type and external IDs
- Services, inquiries, appointments
- Orders, order items, and payments for later phases
- Tasks/follow-ups
- WhatsApp message templates
- Notifications
- Audit logs
- Tenant-oriented indexes and uniqueness constraints

## Multi-tenancy rules

1. Business-domain records carry `organizationId` directly where practical.
2. Application services must always derive the current organization from the authenticated membership/session.
3. Every tenant query, mutation, and relation traversal must enforce the current `organizationId`; UI filtering is not a security boundary.
4. Cross-organization IDs must never be accepted as authorization.
5. Destructive cascades are limited to organization-owned data; nullable actor/assignee references use `SetNull` where appropriate.

## Important implementation notes

- Customer phone numbers are unique per organization, not globally.
- WhatsApp external message IDs are unique within an organization.
- Monetary values use PostgreSQL `Decimal(12,2)`.
- JSON metadata is reserved for provider payloads and extensible audit/context data.
- Authentication/session tables and server-side authorization are implemented in later phases.
- The schema intentionally contains some later-phase entities so future modules do not require a disruptive foundation rewrite.

## Validation

Run:

```bash
pnpm install
pnpm db:generate
pnpm --filter @automation/db prisma validate
pnpm db:migrate
```

The migration command should be run against the local PostgreSQL service configured by Phase 1.

## Acceptance criteria

- Prisma schema validates successfully.
- Prisma Client can be generated.
- Migration can create the PostgreSQL schema from an empty database.
- Tenant-owned models expose organization-scoped indexes/constraints.
- No authentication or WhatsApp business logic is embedded in the database layer.

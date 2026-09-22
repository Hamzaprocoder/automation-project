# Phase 5 — Customer CRM

Implemented tenant-scoped customer CRUD and CRM profile data.

- Paginated customer listing with search and status filtering
- Customer creation and organization-scoped phone uniqueness
- Customer profile with tags, recent conversations/messages, appointments, and tasks as a basic activity timeline
- Customer updates
- Soft deletion via `deletedAt`
- RBAC through permission middleware
- Customer schema extended with lifecycle/status fields required by this phase

All customer queries derive `organizationId` from authenticated request context; the API does not accept an organization ID from clients.

The schema now includes `CustomerStatus`, `deletedAt`, `whatsappNumber`, `address`, `source`, `firstInteractionAt`, and `lastInteractionAt`.

Runtime database migration and curl tests still need to be run in an environment with PostgreSQL available.

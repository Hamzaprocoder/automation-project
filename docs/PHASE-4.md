# Phase 4 — RBAC + Multi-Tenancy Enforcement

Implemented reusable role/permission middleware and tenant-scoped organization member APIs.

## Endpoints

- `GET /api/organization/members` — OWNER/ADMIN only; queries only the authenticated organization.
- `POST /api/organization/members/invite` — OWNER/ADMIN only; adds an existing user to the authenticated organization.

## Tenant isolation

Controllers never accept an organization ID from the client. They use `req.organization.id`, which is populated by the authenticated JWT membership lookup. Organization member queries include that ID in the Prisma `where` clause.

## Roles

OWNER, ADMIN, MANAGER, STAFF are represented by the Prisma `OrganizationRole` enum.

## Validation

The repository API does not provide a local runtime/DB environment here, so end-to-end curl tests were not executed. The implementation was aligned with the current Phase 2 schema: that schema does not contain `deletedAt` or `joinedAt`, so those fields were intentionally not used.

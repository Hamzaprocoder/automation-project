# Phase 15 — Audit Logs

## Objective

Provide a tenant-scoped, queryable audit history for security, debugging, and operational review.

## Implemented

- Reused the existing Prisma `AuditLog` model with nullable `actorId` for authenticated/system actions.
- Every record is scoped by `organizationId`.
- `action`, `entityType`, `entityId`, `metadata`, and `createdAt` capture the event history.
- `GET /api/audit-logs` is restricted to OWNER and ADMIN.
- Pagination and filtering by action or actor/user ID are supported.
- Core MVP actions are logged:
  - `user.login`
  - `customer.created`
  - `customer.updated`
  - `customer.deleted`
  - `appointment.created`
  - `appointment.status_changed`
  - `order.created`
  - `order.completed`
  - `message.sent`
  - `member.invited`

## API

`GET /api/audit-logs?page=1&limit=30&action=customer.created&userId=<userId>`

The response contains `data` and pagination metadata.

## Security

- Authentication is required.
- OWNER and ADMIN roles only.
- Audit queries always use the current organization ID.
- Audit writes are server-side; clients cannot submit arbitrary audit records through an API endpoint.
- The audit service maps the request user ID to the schema's `actorId` field.

## Database

The repository already contained the Phase 15-compatible `AuditLog` model and reverse relations before this module was added, so no duplicate schema model or migration was created.

## Runtime verification

After pulling the latest code:

1. Run `pnpm db:generate`.
2. Run `pnpm db:migrate` if your local database is behind the repository schema.
3. Start the API.
4. Log in and create/update/delete a customer.
5. Request `GET /api/audit-logs` as OWNER or ADMIN.
6. Verify a STAFF account receives HTTP 403.

Runtime verification has not been performed by the repository connector.

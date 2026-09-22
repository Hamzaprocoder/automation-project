# Phase 9 — Services & Appointments

## Scope

Phase 9 adds a tenant-scoped service catalogue and appointment management API.

### Services

- List active/non-deleted services.
- Create services for OWNER/ADMIN/MANAGER.
- Update services for OWNER/ADMIN/MANAGER.
- Soft-delete services for OWNER/ADMIN.
- Recreate a previously deleted service with the same organization/name.

### Appointments

- Create appointments linked to a tenant customer.
- Optionally link an active tenant service.
- Optionally assign an OrganizationMember from the same tenant.
- Automatically calculate `endsAt` from service duration when omitted.
- List by status, staff, customer, date range, today, or upcoming.
- Paginate results.
- Update appointment details and status.
- Enforce the supported status flow:
  - SCHEDULED → CONFIRMED / CANCELLED / NO_SHOW
  - CONFIRMED → COMPLETED / CANCELLED / NO_SHOW
  - terminal states remain unchanged.
- Soft-delete appointments.
- Update customer `lastInteractionAt` when an appointment is created, updated, or deleted.

## Endpoints

### Services

- GET `/api/services`
- POST `/api/services`
- PATCH `/api/services/:id`
- DELETE `/api/services/:id`

### Appointments

- GET `/api/appointments`
- POST `/api/appointments`
- PATCH `/api/appointments/:id`
- DELETE `/api/appointments/:id`

## Tenant safety

All service and appointment queries are scoped by the authenticated organization. Customer, service, and staff references are also validated against the same organization.

## Local setup

After pulling these changes locally:

```bash
pnpm db:generate
pnpm db:migrate
pnpm --filter @automation/api dev
```

Because this repository is being edited through GitHub, the migration must be generated/applied from the local development environment where PostgreSQL is running. Runtime migration/API tests are not claimed here.

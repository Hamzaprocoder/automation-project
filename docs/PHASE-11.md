# Phase 11 — n8n Automation

## Objective

Use n8n as an orchestration layer while keeping the CRM as the system of record.

n8n must never connect directly to PostgreSQL. All reads and writes go through authenticated CRM APIs.

## CRM automation API

The MVP automation integration is scoped to one organization using:

- `N8N_AUTOMATION_TOKEN`
- `N8N_ORGANIZATION_ID`

n8n authenticates with:

`Authorization: Bearer <N8N_AUTOMATION_TOKEN>`

The token is intentionally long-lived for the MVP. Store it only in n8n credentials/environment secrets and never commit it.

### Endpoints

- `GET /api/automations/upcoming-appointments?hours=24`
  - Returns non-deleted appointments with status `SCHEDULED` or `CONFIRMED` in the requested future window.
  - Maximum look-ahead is 168 hours.
- `GET /api/automations/overdue-followups`
  - Returns up to 50 open conversations whose latest activity is at least 24 hours old and still unread.
- `POST /api/automations/log`
  - Records `SUCCESS` or `FAILED` execution results in the tenant-scoped audit log.
- `POST /api/automations/log-error`
  - Convenience endpoint for n8n Error Trigger workflows; always records `FAILED`.

## Workflow designs

### 1. New WhatsApp message

Webhook from CRM -> fetch conversation/customer -> check unread + assignment -> notify staff -> log execution.

### 2. Appointment confirmation

Appointment-created webhook -> check WhatsApp availability/consent -> send approved template through CRM API -> log result.

### 3. Appointment reminder

Hourly Cron -> upcoming appointments endpoint -> filter eligible appointments -> send approved template through CRM API -> log result.

**Important:** reminder idempotency is not implemented yet. Before enabling production reminder sends, the CRM should add a durable reminder-delivery record or equivalent idempotency key.

### 4. Overdue follow-up

Two-hour Cron -> overdue follow-ups endpoint -> create a CRM Task through an authenticated task endpoint -> optionally notify staff -> log execution.

### 5. Birthday / special occasion

Daily 09:00 Cron -> CRM birthday-customer endpoint -> verify marketing consent -> send approved template through CRM API -> log each result.

A birthday field/customer campaign endpoint is not part of this phase because the current Customer model has no date-of-birth field.

### 6. Failed automation alert

n8n Error Trigger -> POST `/api/automations/log-error` -> CRM records failure in AuditLog -> Owner/Admin notification can be added when notification automation endpoints are implemented.

## Security rules

1. Never allow n8n direct database access.
2. Keep the automation token out of source control.
3. Bind the MVP token to exactly one organization.
4. Use HTTPS/TLS in deployed environments.
5. Rotate the token if exposed.
6. Keep tenant scoping inside CRM services; n8n cannot select an arbitrary organization.
7. Add durable idempotency before automations that send messages or create tasks are enabled in production.

## Local n8n

With Docker:

`docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n`

When n8n itself runs in Docker and the CRM API runs on the host, use:

`http://host.docker.internal:4000/api/automations/upcoming-appointments?hours=24`

Configure the Bearer token in an n8n HTTP Request credential rather than hard-coding it in workflow nodes.

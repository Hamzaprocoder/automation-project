# Phase 14 — Notifications

## Objective

Provide tenant-safe in-app notifications for users.

## API

- GET `/api/notifications`
- GET `/api/notifications/unread-count`
- PATCH `/api/notifications/:id/read`
- POST `/api/notifications/mark-all-read`

All endpoints require the existing authentication middleware.

## Notification creation

Other server modules can call `createNotification()` with an organization, recipient user, notification type, title, message, and optional deep link.

The service verifies that the recipient belongs to the organization before writing the notification. This prevents cross-tenant notification records.

## Supported types

- NEW_MESSAGE
- NEW_APPOINTMENT
- OVERDUE_FOLLOWUP
- APPOINTMENT_REMINDER
- AUTOMATION_FAILED
- SYSTEM

## Data model

Notifications are stored with:

- organizationId
- userId
- type
- title
- message
- optional link
- isRead/readAt
- createdAt

Indexes support unread-count and user notification listing queries.

## Runtime status

The schema and API code are committed to GitHub. Local Prisma migration/generation and endpoint tests still need to be run before declaring the phase runtime-complete.

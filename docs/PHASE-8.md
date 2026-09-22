# Phase 8 — WhatsApp Inbox

## Objective

Backend APIs for the CRM-style WhatsApp inbox: conversation listing, message history, outbound replies, read state, assignment, and internal notes.

## Endpoints

- `GET /api/conversations` — paginated list with `search`, `status`, and `unreadOnly`.
- `GET /api/conversations/:id` — customer, full message history, and internal notes.
- `POST /api/conversations/:id/messages` — persist an outbound text message and send through Meta when credentials are configured.
- `PATCH /api/conversations/:id` — assign a staff member, change status, and/or mark as read.
- `GET /api/conversations/:id/notes` — list internal notes.
- `POST /api/conversations/:id/notes` — create an internal note.

All routes require authentication and are tenant-scoped by the organization in the authenticated request context.

## Messaging behavior

Outbound messages are saved first with `QUEUED` status. The service then enforces the WhatsApp 24-hour customer-service window using the latest inbound message from the same organization/customer.

If the window is expired, the CRM message remains as a `FAILED` record and the API returns HTTP 422. Approved template sending is intentionally deferred to a later phase.

When the window is valid and Meta credentials plus the organization's `whatsappPhoneId` are configured, the official Cloud API is called. Successful sends become `SENT` and store the Meta message ID in `Message.externalId`. API failures become `FAILED`.

If outbound credentials are absent, the message remains `QUEUED` in the CRM so local inbox development can continue without Meta.

## Assignment and tenant safety

Assignment validates that the target user is an `OrganizationMember` of the current organization. Conversation reads, updates, messages, and notes all require the current `organizationId`.

Staff can mark conversations as read. Assignment/status changes require the existing `conversation:assign` permission.

## Internal notes

Phase 8 adds an `InternalNote` model linked to organization, conversation, and author. Notes are not sent to WhatsApp.

## Prisma/runtime setup

The Phase 8 schema adds `ConversationStatus.ARCHIVED` and the `InternalNote` model. Run:

```bash
pnpm db:generate
pnpm db:migrate
```

Then restart the API.

Live curl testing and Prisma migration execution are not claimed here because this GitHub connector does not run the repository's local PostgreSQL/API process.

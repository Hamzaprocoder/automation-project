# Phase 7 — WhatsApp Integration

## Objective

Integrate the official Meta WhatsApp Business Platform webhook for inbound messages and status updates.

## Flow

Meta -> POST /api/webhooks/whatsapp -> signature verification -> organization lookup by phone_number_id -> customer -> conversation -> message.

### Tenant routing

The webhook never attaches a message to an arbitrary or first organization. The Meta `phone_number_id` must match `Organization.whatsappPhoneId`. This is the tenant boundary for inbound WhatsApp traffic.

### Idempotency

Meta may retry webhook deliveries. Incoming messages are checked by the existing composite unique key `organizationId + externalId` before any unread counter is incremented.

### Unread count

Phase 7 adds `Conversation.unreadCount` to the Prisma schema. Every new inbound message increments it.

### Message mapping

The service maps common Meta message types to the existing Prisma `MessageType` enum and stores the WhatsApp message ID in `Message.externalId`. Message text is stored in `Message.body`.

## Environment

Add these values to your local .env:

WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_APP_SECRET=...
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...

The token is used for Meta webhook verification. The app secret is used for X-Hub-Signature-256 verification. The access token and phone number ID are reserved for outbound Cloud API work and organization configuration.

## Endpoints

- GET /api/webhooks/whatsapp
- POST /api/webhooks/whatsapp

The GET endpoint handles Meta's verification challenge. The POST endpoint validates the raw request body signature when WHATSAPP_APP_SECRET is configured.

## Runtime setup

After pulling these changes, generate Prisma Client and apply a database migration for the new unreadCount column before starting the API.

Live Meta testing requires a real Meta Business/WhatsApp Business setup, configured phone number, webhook callback, and public HTTPS endpoint such as ngrok.

This repository connector cannot run the local PostgreSQL/API process, so live curl/Prisma Studio verification has not been claimed.

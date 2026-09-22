# 2-Minute Demo Script

## 0:00–0:15 — Introduction

"This is a multi-tenant WhatsApp CRM backend designed for local businesses. The goal is to keep customer conversations, appointments, sales, analytics, notifications, and audit history in one organization-scoped system."

## 0:15–0:35 — Authentication and Tenant Context

Register two separate business accounts or use prepared test data.

"Authentication creates the user and organization context. The API revalidates membership and role information on protected requests."

Show the authenticated customer API.

## 0:35–1:00 — Customer and Conversation Flow

Create or show a customer and conversation.

"The WhatsApp integration is built around the official Meta Cloud API. Incoming webhook events can create or update the customer and conversation, while messages are stored with direction, status, and external IDs."

Show conversation history and unread state if the frontend/API demo supports it.

## 1:00–1:25 — Appointments and Orders

Create an appointment linked to a customer and service, then create an order.

"The domain model connects operational activity back to the customer. Completed and paid orders contribute to customer lifetime metrics."

Show appointment/order records.

## 1:25–1:45 — Analytics, Notifications, and Audit

Show analytics, notification, or audit endpoints/data.

"Important business actions are auditable, notifications are organization and user scoped, and analytics aggregate tenant-owned data."

## 1:45–2:00 — Engineering Close

"The key engineering decision is that tenant isolation and business rules live in the API rather than the client or an automation platform. The repository also includes deployment configuration and API tests for authentication and cross-tenant isolation."

### Demo honesty rule

Only demonstrate features that are actually implemented and working in the current environment. Do not present the skipped AI module, a non-existent frontend workflow, or an unverified live deployment as completed.

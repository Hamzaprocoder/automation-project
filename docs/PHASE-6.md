# Phase 6 — Dashboard

## Objective

Provide a tenant-scoped, read-only dashboard API with real database-backed customer and conversation KPIs.

## Endpoints

- GET /api/dashboard/overview
- GET /api/dashboard/customer-growth?days=30

Both endpoints require authentication. The organization comes from the authenticated request context, so dashboard queries are scoped to the current tenant.

## Overview

The overview endpoint returns:

- total active customers
- customers created in the last 7 days
- customers created in the last 30 days
- open conversations
- unanswered conversations
- five most recent customers
- attention-required items

Appointments, overdue follow-ups, and revenue remain explicit placeholders until their dedicated phases provide the required business logic.

### Unanswered conversation logic

The current schema does not contain an unreadCount or deletedAt field on conversations. To keep this phase compatible with the actual schema, unanswered conversations are identified from the latest message in each organization conversation: a conversation whose latest message is inbound is considered waiting for a reply.

## Customer growth

Customer growth is generated from real customer createdAt values and returned as a zero-filled daily series. The requested range is bounded to 1–90 days.

## Verification

Runtime verification requires the API and PostgreSQL environment to be available. This repository connector can update and inspect repository files, but it cannot execute the local API or PostgreSQL service, so curl/database runtime checks were not claimed as completed here.

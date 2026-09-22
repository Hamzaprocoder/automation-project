# Phase 13 — Analytics

## Objective

Expose tenant-scoped, read-only business analytics from real PostgreSQL data.

## Endpoints

- GET `/api/analytics/overview`
- GET `/api/analytics/revenue-series?days=30`
- GET `/api/analytics/customer-growth?days=30`

All endpoints require authentication and the existing `analytics:view` permission. Current RBAC grants this to OWNER, ADMIN, and MANAGER.

## Overview metrics

The overview returns:

- Customer total, new customers this month/last month, returning customers this month, and a simple retention rate.
- Paid completed revenue for this month/last month, paid order count, and this month's average order value.
- Appointment completion and no-show rates using completed/cancelled/no-show appointments as the outcome denominator.
- Open/unanswered conversations.
- A simple 30-day average response time and unanswered inbound rate based on inbound messages followed by an outbound response.

Response-time metrics are intentionally operational approximations for MVP. A future SLA model can persist first-response timestamps for exact reporting.

## Series

Revenue is grouped by UTC calendar day and zero-filled across the requested range.

Customer growth is grouped by UTC calendar day and zero-filled across the requested range.

`days` defaults to 30 and is restricted to 1–90.

## Tenant isolation

Every query filters by `organizationId`, and access is protected by the existing authentication/RBAC middleware.

## Important metric definitions

- Returning customer: has at least one completed/paid order before the current month and at least one completed/paid order during the current month.
- Retention rate: returning customers this month divided by all active customers.
- Revenue: completed orders whose order payment status is PAID.
- Average order value: this-month paid revenue divided by this-month paid completed orders.
- Unanswered rate: inbound messages in the last 30 days without a subsequent outbound response within the sampled message sequence.

## Runtime status

Code has been added to GitHub, but local PostgreSQL, Prisma generation/migration, and API runtime tests have not been executed in this environment. Do not treat the phase as runtime-complete until those checks pass locally.

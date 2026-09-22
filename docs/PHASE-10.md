# Phase 10 — Orders / Sales

Adds tenant-scoped orders, order items, order/payment statuses, order filtering/detail endpoints, and customer lifetime sales metrics.

## Endpoints
- GET /api/orders
- GET /api/orders/:id
- POST /api/orders
- PATCH /api/orders/:id
- DELETE /api/orders/:id

## Lifetime metrics
Customer now has `totalOrders` and `totalSpent`. They are updated transactionally when an order enters or leaves the COMPLETED + PAID state, and when such an order is soft-deleted.

## Status flow
DRAFT → CONFIRMED → IN_PROGRESS → COMPLETED, with cancellation available before completion.

## Local migration
Run locally after pulling the GitHub changes:

```bash
pnpm db:generate
pnpm db:migrate
pnpm --filter @automation/api dev
```

Runtime migration/API tests were not executed through the GitHub connector.

# Portfolio Package

## GitHub Description

Production-minded multi-tenant WhatsApp CRM for local businesses, built with Next.js, Express, PostgreSQL, Prisma, RBAC, Meta WhatsApp Cloud API, analytics, notifications, audit logging, and automation-ready APIs.

## CV / Resume

**WhatsApp Local Business CRM & Automation Platform**  
*Full-Stack SaaS Application*

Designed and built a multi-tenant CRM foundation for local businesses that manage customer communication through WhatsApp.

- Implemented secure authentication, RBAC, organization-level tenant isolation, and audit logging.
- Integrated the official Meta WhatsApp Cloud API with webhook signature verification, inbound message processing, outbound messaging, and idempotency handling.
- Built customer, conversation, appointment, service, order, payment, notification, dashboard, and analytics modules.
- Added automated API tests covering authentication and cross-tenant isolation.
- Prepared production deployment configuration for Vercel, Railway/Render/Fly.io, and managed PostgreSQL.

**Tech:** Next.js, React, TypeScript, Express, Prisma, PostgreSQL, Tailwind CSS, Jest, Supertest, Meta WhatsApp Cloud API, n8n-ready REST APIs.

> Do not claim AI features or a live production deployment on a CV until those capabilities have actually been implemented and verified.

## LinkedIn

**WhatsApp Local Business CRM & Automation Platform**

I built a production-minded multi-tenant SaaS CRM foundation for local businesses that rely on WhatsApp for customer communication.

The platform connects customer records, WhatsApp conversations, appointments, services, orders, analytics, notifications, and audit history while enforcing organization-level tenant isolation and role-based access control.

Technical highlights:
- Multi-tenant architecture with server-side organization scoping
- Owner/Admin/Manager/Staff RBAC
- Official Meta WhatsApp Cloud API integration
- Webhook HMAC verification and message idempotency
- Customer, conversation, appointment, order, and analytics APIs
- Notifications and audit logging
- Jest + Supertest API tests for authentication and tenant isolation
- Production deployment configuration for Vercel and Railway-style hosting

The project focuses on maintainability, security boundaries, and business-domain modeling rather than only building a UI prototype.

## Interview Talking Points

### Why multi-tenancy?

Each business is represented by an organization. Business records carry an `organizationId`, while authenticated middleware establishes the organization context from the session. Services then scope reads and writes to that context instead of trusting organization identifiers supplied by the client.

### How is tenant isolation tested?

The API test suite creates two independent organizations, creates a customer in organization A, and verifies that organization B receives a not-found response for the customer and cannot see it in its customer list.

### Why use the official WhatsApp API?

The system is designed around Meta's official WhatsApp Cloud API and webhook model. This provides a supported integration path and avoids scraping or unofficial WhatsApp automation.

### Why keep n8n outside the backend?

Core business rules remain inside the API. n8n is treated as an external automation layer that can call authenticated endpoints for scheduled or event-driven workflows without becoming the source of truth for CRM state.

### What would you build next?

The immediate product extension would be a complete Next.js CRM interface for dashboard, inbox, customers, appointments, and orders. After that, AI assistance, richer n8n workflows, billing, and observability can be added incrementally.

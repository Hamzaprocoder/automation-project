# Phase 3 — Authentication

Implemented the MVP authentication foundation:

- Registration creates User, Organization, and OWNER membership atomically.
- Passwords are hashed with bcrypt.
- Login issues a signed JWT in an HTTP-only cookie.
- Logout clears the cookie.
- Protected `GET /api/auth/me` verifies the JWT and re-checks the organization membership in PostgreSQL.
- Zod validates registration and login payloads.
- CORS credentials, Helmet, cookie parsing, and request logging are configured.
- Tenant context is attached to the Express request from the verified session membership.

## Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me` (protected)
- `GET /health`

## Security notes

- `JWT_SECRET` must be at least 32 characters.
- JWT is never returned to the browser response body; it is stored in an HTTP-only cookie.
- Login uses the same generic invalid-credentials response for unknown users and wrong passwords.
- Authorization is revalidated against the organization membership instead of trusting role/org claims alone.
- This phase uses stateless JWT sessions; later security hardening can add server-side session revocation/rotation if required.

## Validation

Install dependencies and run the API TypeScript check:

```bash
pnpm install
pnpm --filter @automation/api lint
```

For an end-to-end check, start PostgreSQL, apply the Prisma migration, set `JWT_SECRET`, then exercise register/login/me/logout with a cookie jar.

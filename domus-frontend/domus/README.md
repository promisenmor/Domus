# Domus frontend

The Domus frontend is a Next.js application that consumes the Django API in the repository root.

## Local development

1. Start the Django API from the repository root at `http://localhost:8000`.
2. Copy `env.local.example` to `.env.local`.
3. Install dependencies and start Next.js:

```powershell
npm install
npm run dev
```

The frontend is available at `http://localhost:3000`.

## Client accounts

Phase 2 provides client registration, email verification, sign in, password recovery, a client dashboard, saved properties, enquiry history, profile editing, and account settings.

The browser communicates with same-origin Next.js API routes. The API routes call Django and keep JWT access and refresh tokens in HttpOnly cookies; credentials are not stored in browser local storage. Email verification and password recovery links are sent by the backend, so the Django email/Celery configuration must be enabled for those flows.

The backend endpoints used by this phase are documented in the root `README.md`. Frontend route handlers currently target those existing `/api/...` endpoints.

## Validation

```powershell
npm run lint
npm run build
```

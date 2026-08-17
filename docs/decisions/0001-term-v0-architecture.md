# 0001 — term-v0 Architecture & Cloud Fallback Client

- **Status**: Accepted
- **Date**: 2026-08-17

## Context

The system must run seamlessly both in local development (even when local PostgreSQL is not running) and on production Railway containers. Furthermore, the UI must match the `term-v0` design aesthetic without heavy framework bloat.

## Decision

We implement a Vanilla JS / CSS SPA in `public/` that communicates with a local Express REST API (`/api`), falling back automatically to the deployed Railway API (`https://api-production-83367.up.railway.app/api`) when running in local client-only or disconnected mode. Database persistence is managed via Prisma ORM connected to PostgreSQL 18.6 with pgbot telemetry.

## Consequences

- Zero build step required for the frontend; instant browser reload.
- Full offline / local resilience while preserving synchronized cloud data.
- Native TypeScript safety on the backend.

## Links

- Design: [docs/design/term-v0-system.md](../design/term-v0-system.md)
- Codebase Navigation: [docs/ai/README.md](../ai/README.md)

# pgbot Database Telemetry

## What
Subsystem providing real-time PostgreSQL health metrics (buffer cache hit ratios, active query execution durations, index sizes, and table dead tuple ratios) via pgbot CLI wrapper and native SQL fallbacks.

## Where
- Observability router: `src/routes/pgbotRoutes.ts` — `router`
- Health inspection: `src/routes/pgbotRoutes.ts` — `GET /api/pgbot/inspect`
- Index profiler: `src/routes/pgbotRoutes.ts` — `GET /api/pgbot/indexes`
- Active queries: `src/routes/pgbotRoutes.ts` — `GET /api/pgbot/queries`
- Vacuum health: `src/routes/pgbotRoutes.ts` — `GET /api/pgbot/vacuum`
- Trigger seed endpoint: `src/routes/pgbotRoutes.ts` — `POST /api/pgbot/seed`

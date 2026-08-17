# Backend Routes & API

## What
Express application assembly and route mounting for CRUD resources, milestones, sprint tasks, squad management, and progress statistics.

## Where
- Application bootstrap: `src/app.ts` — `app`
- Server listen entrypoint: `src/index.ts` — `main`
- Milestone endpoints: `src/routes/deadlineRoutes.ts` — `router`
- Task CRUD & assignment: `src/routes/taskRoutes.ts` — `router`
- Resource catalog: `src/routes/resourceRoutes.ts` — `router`
- Squad members: `src/routes/teamRoutes.ts` — `router`
- Progress aggregations: `src/routes/progressRoutes.ts` — `router`

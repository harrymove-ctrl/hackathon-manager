# Hackathon Manager - Project Plan

## Overview
A team-based hackathon manager with resource management, deadline tracking, and progress tracking. Includes pgbot integration for PostgreSQL observability.

## Tech Stack
- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (Railway)
- **ORM**: Prisma
- **MCP**: pgbot for database observability
- **Deployment**: Railway

## Project Structure
```
├── src/
│   ├── controllers/    # Route handlers
│   ├── services/       # Business logic
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   ├── utils/          # Helpers
│   └── index.ts        # Entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── scripts/
│   └── pgbot/          # pgbot integration scripts
├── .env.example
├── package.json
├── tsconfig.json
└── railway.json
```

## Features
1. **Resources**: Upload/manage hackathon resources (docs, links, files)
2. **Deadlines**: Track submission deadlines with reminders
3. **Progress Tracker**: Task assignments, completion status per team member
4. **pgbot Integration**: Database health monitoring via MCP

## Phases
- [x] [Phase 1: Project Setup](phase-01-setup.md) - Dependencies, TypeScript, Prisma
- [x] [Phase 2: Database Schema](phase-02-schema.md) - Models for resources, deadlines, tasks
- [x] [Phase 3: API Routes](phase-03-api.md) - CRUD endpoints
- [x] [Phase 4: pgbot Integration](phase-04-pgbot.md) - MCP server setup & PostgreSQL telemetry
- [x] [Phase 5: Frontend](phase-05-frontend.md) - Modern Dashboard UI & live countdown ticker
- [x] [Phase 6: Railway Deploy](phase-06-railway.md) - CI/CD setup, Nixpacks build config & seed script

## Timeline
- **Day 1**: Phases 1-3 (Backend core)
- **Day 2**: Phases 4-5 (pgbot + Frontend)
- **Day 3**: Phase 6 (Deployment)

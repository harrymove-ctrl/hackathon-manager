# Database & ORM Layer

## What
Prisma schema definition, singleton client instance, and automated database seed for the BNB Chain Smart Money Era hackathon tracks.

## Where
- Schema models: `prisma/schema.prisma` — `TeamMember`, `Resource`, `Deadline`, `Task`
- Prisma client instance: `src/db/index.ts` — `prisma`
- Official BNB Chain seed data: `src/db/seedData.ts` — `seedBnbChainData`
- Seed executable script: `scripts/seed.ts`

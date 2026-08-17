# Phase 1: Project Setup

**Date**: 2026-08-15 | **Priority**: High | **Status**: Completed

## Overview
Set up the Node.js + Express + TypeScript project with Prisma ORM.

## Requirements
- Node.js 20+
- npm/yarn/pnpm
- TypeScript 5.x (strict mode)
- Prisma 6.x
- Zod for validation

## Architecture

### Project Structure (Layered Architecture)
```
src/
├── config/          # Environment validation, database config
├── controllers/    # HTTP request/response handlers
├── services/       # Business logic
├── repositories/   # Data access layer
├── routes/         # Express router definitions
├── middleware/     # Auth, validation, error handling
├── utils/          # Helpers, constants
├── types/          # TypeScript interfaces
└── db/             # Prisma client, migrations
```

### Dependencies (2026 Recommended)
```json
{
  "dependencies": {
    "express": "^4.18",
    "@prisma/client": "^6.x",
    "pg": "^8.11",
    "dotenv": "^16.x",
    "cors": "^2.8",
    "helmet": "^7.x",
    "zod": "^3.x",
    "@anthropic-ai/mcp-pgbot": "latest",
    "@modelcontextprotocol/sdk": "latest"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "prisma": "^6.x",
    "@types/node": "^20.x",
    "@types/express": "^4.x",
    "tsx": "^4.x",
    "nodemon": "^3.x",
    "vitest": "^2.x"
  }
}
```

### Environment Validation (Fail-Fast)
```typescript
// src/config/index.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

export const env = envSchema.parse(process.env);
```

## Implementation Steps

### 1. Initialize Project
```bash
npm init -y
npm install express @prisma/client pg dotenv cors helmet zod
npm install -D typescript @types/node @types/express @types/pg prisma tsx nodemon
npx tsc --init
```

### 2. TypeScript Configuration
Create `tsconfig.json` with:
- `target: ES2022`
- `module: NodeNext`
- `moduleResolution: NodeNext`
- `outDir: ./dist`
- `rootDir: ./src`

### 3. Project Structure
```
src/
├── index.ts           # Entry point
├── app.ts             # Express app setup
├── config/
│   └── index.ts       # Config from env
├── controllers/
├── services/
├── routes/
├── middleware/
└── utils/
```

### 4. Environment Setup
Create `.env.example`:
```
DATABASE_URL=postgres://user:pass@host:5432/db
PORT=3000
NODE_ENV=development
```

## Success Criteria
- [x] Project initializes with `npm install`
- [x] TypeScript compiles without errors
- [x] Express server starts on port 3000
- [x] Prisma connects to PostgreSQL

## Next Steps
→ [Phase 2: Database Schema](phase-02-schema.md)

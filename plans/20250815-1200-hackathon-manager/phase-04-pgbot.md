# Phase 4: pgbot Integration

**Date**: 2026-08-15 | **Priority**: Medium | **Status**: Pending

## Overview
Integrate pgbot MCP server for PostgreSQL observability using `@anthropic-ai/mcp-pgbot` npm package.

## pgbot MCP Overview
- **Package**: `@anthropic-ai/mcp-pgbot` (npm install)
- **Tools**: pg_inspect, pg_indexes, pg_queries, pg_vacuum, pg_kill, pg_stats
- **Transport**: StdioClientTransport for local, HttpClientTransport for remote

## Architecture

```
┌─────────────┐     ┌─────────────┐
│  Express    │────▶│  PostgreSQL │
│  API        │     │  (Railway)  │
└─────────────┘     └─────────────┘
       │                   ▲
       │                   │
       ▼                   │
┌─────────────┐            │
│  pgbot      │────────────┘
│  (MCP)     │
└─────────────┘
```

## Setup Steps

### 1. Install Dependencies
```bash
npm install @anthropic-ai/mcp-pgbot @modelcontextprotocol/sdk
```

### 2. Create MCP Client (src/lib/mcp.ts)
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

const PGBOT_PATH = './node_modules/.bin/mcp-pgbot';

const transport = new StdioClientTransport({
  spawn: () => spawn(PGBOT_PATH, [], {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL! },
  }),
});

export const mcpClient = new Client(
  { name: 'pgbot-client', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

await mcpClient.connect(transport);
```

### 3. Create pgbot Routes (src/routes/pgbot.ts)
```typescript
import express from 'express';
import { mcpClient } from '../lib/mcp.js';

const router = express.Router();

router.get('/inspect', async (_req, res) => {
  const result = await mcpClient.callTool({ name: 'pg_inspect', arguments: {} });
  res.json(result);
});

router.get('/indexes', async (_req, res) => {
  const result = await mcpClient.callTool({ name: 'pg_indexes', arguments: {} });
  res.json(result);
});

router.get('/queries', async (_req, res) => {
  const result = await mcpClient.callTool({ name: 'pg_queries', arguments: {} });
  res.json(result);
});

router.post('/vacuum', async (req, res) => {
  const { table } = req.body;
  const result = await mcpClient.callTool({ name: 'pg_vacuum', arguments: { table } });
  res.json(result);
});

export default router;
```

### 4. Create Read-Only Role
```sql
CREATE ROLE pgbot_read LOGIN PASSWORD 'secure-password';
GRANT CONNECT ON DATABASE hackathon_manager TO pgbot_read;
GRANT USAGE ON SCHEMA public TO pgbot_read;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO pgbot_read;
GRANT pg_monitor TO pgbot_read;
```

### 5. Security Middleware
```typescript
// src/middleware/auth.ts
export const pgbotAuth = (req, res, next) => {
  // Add JWT/session check here for production
  if (process.env.NODE_ENV === 'production') {
    // Require auth token
  }
  next();
};
```

## Environment Variables
```
DATABASE_URL=postgres://user:pass@host:5432/hackathon_manager
# pgbot reads DATABASE_URL automatically
```

## Success Criteria
- [ ] `@anthropic-ai/mcp-pgbot` installed via npm
- [ ] MCP client connects to pgbot subprocess
- [ ] `/api/pgbot/inspect` returns database metadata
- [ ] `/api/pgbot/indexes` shows index analysis
- [ ] `/api/pgbot/queries` shows running queries
- [ ] pgbot routes protected with auth middleware

## Next Steps
→ [Phase 5: Frontend](phase-05-frontend.md)

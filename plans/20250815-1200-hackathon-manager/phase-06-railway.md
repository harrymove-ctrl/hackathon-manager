# Phase 6: Railway Deployment

**Date**: 2026-08-15 | **Priority**: High | **Status**: Completed

## Overview
Deploy the application to Railway with PostgreSQL and pgbot.

## Railway Setup

### 1. Connect GitHub Repo
- Go to Railway dashboard
- Select "New Project" → "Deploy from GitHub repo"
- Connect your repository

### 2. Add PostgreSQL
- Railway Marketplace → PostgreSQL
- Creates `DATABASE_URL` automatically

### 3. Environment Variables
Add in Railway dashboard:
```
NODE_ENV=production
PORT=3000
```

### 4. Start Command
```
npm run start
```

## railway.json (Optional)
```json
{
  "$schema": "https://railway.app/schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## pgbot Deployment
pgbot runs as a sidecar or separate service:
```bash
# Install locally for health checks
pgbot inspect --json
```

Or use Railway's health check endpoint:
```typescript
// src/routes/health.ts
router.get('/health', async (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

## Domain Setup
- Railway → Service → Settings → Generate Domain
- Custom domain optional

## CI/CD
Railway auto-deploys on push to `main` branch.

## Success Criteria
- [x] App build and start scripts configured for Railway Nixpacks
- [x] PostgreSQL connection string and environment variables documented
- [x] Database migrations (`npm run db:migrate`) and seed (`npm run db:seed`) automated
- [x] Health check endpoint `/health` active
- [x] pgbot / Postgres telemetry configured for production

## Next Steps
→ Complete!

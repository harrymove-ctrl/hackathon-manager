# Hackathon Manager

Team hackathon manager with resources, deadlines, progress tracking, and pgbot PostgreSQL observability.

## Features

- 📚 **Resources**: Manage hackathon documents, links, and files
- ⏰ **Deadlines**: Track submission deadlines with priority levels
- ✅ **Progress Tracker**: Task assignments for team members (2-5 people)
- 📊 **Dashboard**: Overview of team progress and upcoming deadlines
- 🔍 **pgbot Integration**: PostgreSQL observability and health monitoring

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Railway)
- **Deployment**: Railway
- **pgbot**: PostgreSQL observability (via CLI wrapper)

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

## API Endpoints

### Resources
- `GET /api/resources` - List all resources
- `POST /api/resources` - Create resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

### Deadlines
- `GET /api/deadlines` - List all deadlines
- `GET /api/deadlines/upcoming` - Get upcoming deadlines
- `POST /api/deadlines` - Create deadline
- `PUT /api/deadlines/:id` - Update deadline
- `DELETE /api/deadlines/:id` - Delete deadline

### Tasks
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/team/:memberId` - Get tasks by team member
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Team
- `GET /api/team` - List team members
- `POST /api/team` - Add team member
- `PUT /api/team/:id` - Update team member
- `DELETE /api/team/:id` - Remove team member

### Progress
- `GET /api/progress/summary` - Overall progress stats
- `GET /api/progress/team/:memberId` - Individual team member progress

### pgbot (Database Observability)
- `GET /api/pgbot/inspect` - Database health inspection
- `GET /api/pgbot/indexes` - Index analysis
- `GET /api/pgbot/queries` - Query performance
- `GET /api/pgbot/vacuum` - Vacuum health

### Health
- `GET /health` - Health check

## Deployment

Deployed on Railway: https://railway.app

## License

MIT

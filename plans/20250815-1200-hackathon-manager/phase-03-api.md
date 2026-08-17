# Phase 3: API Routes

**Date**: 2026-08-15 | **Priority**: High | **Status**: Completed

## Overview
Build RESTful API endpoints for all CRUD operations.

## API Endpoints

### Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/resources | List all resources |
| GET | /api/resources/:id | Get single resource |
| POST | /api/resources | Create resource |
| PUT | /api/resources/:id | Update resource |
| DELETE | /api/resources/:id | Delete resource |

### Deadlines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/deadlines | List all deadlines |
| GET | /api/deadlines/upcoming | Get upcoming deadlines |
| POST | /api/deadlines | Create deadline |
| PUT | /api/deadlines/:id | Update deadline |
| DELETE | /api/deadlines/:id | Delete deadline |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | List all tasks |
| GET | /api/tasks/team/:memberId | Get tasks by assignee |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

### Team
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/team | List team members |
| POST | /api/team | Add team member |
| DELETE | /api/team/:id | Remove team member |

### Progress (Dashboard)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/progress/summary | Overall progress stats |
| GET | /api/progress/team/:id | Individual team member progress |

## Implementation Steps

### 1. Controller Pattern
```typescript
// src/controllers/resourceController.ts
export const getResources = async (req, res) => {
  const resources = await prisma.resource.findMany();
  res.json(resources);
};
```

### 2. Route Registration
```typescript
// src/routes/index.ts
router.use('/resources', resourceRoutes);
router.use('/deadlines', deadlineRoutes);
// ...
```

### 3. Validation with Zod
```typescript
const createResourceSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['DOCUMENT', 'LINK', 'FILE', 'NOTE']),
  url: z.string().url().optional(),
  tags: z.array(z.string()).default([])
});
```

## Success Criteria
- [x] All endpoints return correct HTTP status codes
- [x] Validation prevents invalid data
- [x] Error handling returns meaningful messages
- [x] API responds within 200ms for queries

## Next Steps
→ [Phase 4: pgbot Integration](phase-04-pgbot.md)

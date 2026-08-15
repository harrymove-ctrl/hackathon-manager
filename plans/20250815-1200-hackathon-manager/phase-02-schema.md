# Phase 2: Database Schema

**Date**: 2026-08-15 | **Priority**: High | **Status**: Pending

## Overview
Define Prisma schema for resources, deadlines, tasks, and team members.

## Requirements
- PostgreSQL 13+
- Prisma 5.x

## Data Models

### TeamMember
```prisma
model TeamMember {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  role      String   @default("member")
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Resource
```prisma
model Resource {
  id          String      @id @default(uuid())
  title       String
  description String?
  type        ResourceType
  url         String?
  content     String?
  tags        String[]
  createdBy   String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum ResourceType {
  DOCUMENT
  LINK
  FILE
  NOTE
}
```

### Deadline
```prisma
model Deadline {
  id          String       @id @default(uuid())
  title       String
  description String?
  dueDate     DateTime
  priority    Priority     @default(MEDIUM)
  status      Status       @default(PENDING)
  assignedTo  String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum Status {
  PENDING
  IN_PROGRESS
  COMPLETED
  OVERDUE
}
```

### Task
```prisma
model Task {
  id          String      @id @default(uuid())
  title       String
  description String?
  status      TaskStatus  @default(TODO)
  priority    Priority    @default(MEDIUM)
  assigneeId  String?
  assignee    TeamMember? @relation(fields: [assigneeId], references: [id])
  deadlineId  String?
  deadline    Deadline?   @relation(fields: [deadlineId], references: [id])
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  completedAt DateTime?
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}
```

## Implementation Steps

1. Create `prisma/schema.prisma`
2. Add all models above
3. Run `npx prisma migrate dev --name init`
4. Generate Prisma client

## Success Criteria
- [ ] Schema validates with `prisma validate`
- [ ] Migration runs successfully
- [ ] Prisma client generates types

## Next Steps
→ [Phase 3: API Routes](phase-03-api.md)

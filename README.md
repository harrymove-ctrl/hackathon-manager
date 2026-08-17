# Hackathon Manager

A comprehensive hackathon management platform for tracking multiple hackathons, deadlines, team progress, resources, and news.

## 🎯 Concept

**Generic Hackathon Manager** - Works with ANY hackathon, not just BNB Chain:
- Add any hackathon with custom tracks/prizes
- Track multiple hackathons simultaneously  
- News/announcements feed per hackathon
- Team collaboration tools
- Deadline countdown timers
- Resource library
- pgbot PostgreSQL observability

## 📊 Features

### Core Features
- [x] **Projects** - Manage multiple hackathons
- [x] **Resources** - Documents, links, files
- [x] **Deadlines** - Priority-based tracking with countdowns
- [x] **Tasks** - Assignment system for team members
- [x] **Team** - Member management with progress tracking
- [x] **Progress** - Real-time stats dashboard
- [ ] **News/Announcements** - Hackathon news feed
- [ ] **Frontend Dashboard** - Terminal-style UI

### Database Models

```
Project
├── name, description, url
├── startDate, endDate
├── status (ACTIVE, ARCHIVED)
├── tracks[] (name, prize, description)
├── news[] (title, content, publishedAt)
├── resources[]
├── deadlines[]
├── tasks[]
└── teamMembers[]

News (NEW)
├── projectId
├── title
├── content (markdown)
├── url (optional link)
├── priority (LOW, MEDIUM, HIGH)
├── publishedAt
└── isRead (boolean)

Resource
├── projectId
├── title, description
├── type (DOCUMENT, LINK, FILE, NOTE)
├── url
├── tags[]
└── createdBy

Deadline
├── projectId
├── title, description
├── dueDate
├── priority (LOW, MEDIUM, HIGH, CRITICAL)
├── status (PENDING, IN_PROGRESS, COMPLETED, OVERDUE)
└── assignedTo

Task
├── projectId
├── title, description
├── status (TODO, IN_PROGRESS, DONE)
├── priority (LOW, MEDIUM, HIGH, CRITICAL)
├── assigneeId → TeamMember
└── deadlineId → Deadline

TeamMember
├── projectId
├── name, email, role
└── tasks[]
```

## 🎨 Design

### Terminal Aesthetic (term-v0 inspired)
- Dark theme: `#0a0a0f` background
- Accent colors: Cyan `#00d4ff`, Green `#00ff88`, Yellow `#ffcc00`
- Fonts: JetBrains Mono / Fira Code
- ASCII-art borders and decorations

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│  🚀 HACKATHON MANAGER           [Multiple Hackathons]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ HACKATHONS ──┐  ┌─ NEWS FEED ─────────────────────┐ │
│  │ ● BNB Chain   │  │ 📢 TermiX announces $10K prize   │ │
│  │ ○ ETH Global  │  │ 📢 Submissions open!            │ │
│  │ ○ ETH Denver   │  │ 📢 New workshop added          │ │
│  └───────────────┘  └───────────────────────────────────┘ │
│                                                             │
│  ┌─ DEADLINES ──────────────┐  ┌─ TEAM PROGRESS ───────┐ │
│  │ 🔴 23d 14h Submission   │  │ alice   ████████░░ 80%  │ │
│  │ 🟡 2d 6h Team Review   │  │ bob     ██████░░░░ 60%  │ │
│  │ 🟢 5d Documentation    │  │ carol   ████░░░░░░ 40%  │ │
│  └────────────────────────┘  └─────────────────────────┘ │
│                                                             │
│  ┌─ TASKS ──────────────────────────────────────────────┐   │
│  │ [✓] Design Agent Architecture        alice     DONE   │   │
│  │ [●] Implement Rebalancing Agent      alice    65%   │   │
│  │ [○] Grid Trading Agent              bob       TODO  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🟢 DB: Connected  •  Tables: 12  •  Cache: 99.8%       │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL (Railway) |
| ORM | Prisma |
| Monitoring | pgbot |
| Frontend | Terminal-style dashboard |
| Deployment | Railway |

## 📡 API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### News (NEW)
- `GET /api/projects/:id/news` - Get news feed
- `POST /api/news` - Create news item
- `PUT /api/news/:id` - Mark as read
- `DELETE /api/news/:id` - Delete news

### Resources
- `GET /api/resources` - List resources
- `POST /api/resources` - Create resource
- `PUT /api/resources/:id` - Update
- `DELETE /api/resources/:id` - Delete

### Deadlines
- `GET /api/deadlines` - List deadlines
- `GET /api/deadlines/upcoming` - Next 10
- `POST /api/deadlines` - Create
- `PUT /api/deadlines/:id` - Update
- `DELETE /api/deadlines/:id` - Delete

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create
- `PUT /api/tasks/:id` - Update
- `DELETE /api/tasks/:id` - Delete

### Team
- `GET /api/team` - List members
- `POST /api/team` - Add member
- `PUT /api/team/:id` - Update
- `DELETE /api/team/:id` - Remove

### Progress
- `GET /api/progress/summary` - Overall stats

### pgbot
- `GET /api/pgbot/inspect` - DB health
- `GET /api/pgbot/indexes` - Index analysis
- `GET /api/pgbot/queries` - Query perf

### Health
- `GET /health` - Server health

## 🔗 Live URLs

- **API**: https://api-production-83367.up.railway.app
- **Dashboard**: Coming soon...

## 📅 Example Hackathons

### BNB Chain "Smart Money Era"
| Field | Details |
|-------|---------|
| Dates | 5 Aug - 9 Sep 2026 |
| Prize | $30,000 |
| Category | AI / BNB Agent Studio |

### Future Hackathons
- ETH Global (configurable)
- ETH Denver
- Any custom hackathon!

## 💡 Roadmap

### Phase 5: Frontend Dashboard
- [ ] Terminal-style UI
- [ ] News feed component
- [ ] Multi-hackathon selector
- [ ] Real-time countdowns

### Phase 6: News & Announcements
- [ ] News CRUD endpoints
- [ ] News aggregation (RSS/JSON feeds)
- [ ] Priority-based display
- [ ] Read/unread tracking

### Phase 7: Enhancements
- [ ] Real-time updates (WebSocket/SSE)
- [ ] Email notifications
- [ ] Slack/Discord integration
- [ ] Export to Notion/Linear

## License

MIT

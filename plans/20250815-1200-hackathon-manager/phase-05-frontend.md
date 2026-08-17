# Phase 5: Frontend Dashboard

**Date**: 2026-08-15 | **Priority**: High | **Status**: Planning

## Overview
Build a terminal-style dashboard for hackathon management, supporting **multiple hackathons** and a **news feed**.

## Core Features

### 1. Multi-Hackathon Support
```typescript
// Users can switch between hackathons
const projects = [
  { id: "1", name: "BNB Chain Hackathon", status: "ACTIVE" },
  { id: "2", name: "ETH Global", status: "UPCOMING" },
  { id: "3", name: "ETH Denver", status: "UPCOMING" },
];

// Global view shows all deadlines across hackathons
// Per-hackathon view shows specific details
```

### 2. News/Announcements Feed
```typescript
interface News {
  id: string;
  projectId: string;        // Which hackathon
  title: string;
  content: string;         // Markdown content
  url?: string;            // External link
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isRead: boolean;
  publishedAt: Date;
}
```

### 3. Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│  🚀 HACKATHON MANAGER                                      │
│  [Dropdown: Select Hackathon ▼]              [+ Add News]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ HACKATHONS ───────┐  ┌─ NEWS FEED ─────────────────┐ │
│  │ ● BNB Chain  (23d) │  │ 📢 New deadline added       │ │
│  │ ○ ETH Global (45d)  │  │ 📢 $10K extra prize!     │ │
│  │ ○ ETH Denver  (60d) │  │ 🔵 Workshop tomorrow       │ │
│  └────────────────────┘  └────────────────────────────────┘ │
│                                                             │
│  ┌─ DEADLINES ────────┐  ┌─ TRACKS ─────────────────────┐ │
│  │ 🔴 23d Submission   │  │ Main: BNB Agent Studio     │ │
│  │ 🟡 2d Team Review  │  │   Prize: $30,000          │ │
│  │ 🟢 5d Docs         │  │                             │ │
│  └────────────────────┘  │ Altana Partner Track        │ │
│                           │   Prize: 50K XP             │ │
│  ┌─ TEAM PROGRESS ─────┐ └─────────────────────────────┘ │
│  │ alice   ████████░░  │  ┌─ TASKS ──────────────────────┐ │
│  │ bob     ██████░░░░  │  │ [✓] Design Done    alice   │ │
│  │ carol   ████░░░░░  │  │ [●] Implementing   bob 65%  │ │
│  └────────────────────┘  │ [○] Testing        carol   │ │
│                           └───────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  🟢 DB Connected • Tables: 12 • Cache: 99.8% • p99: 5ms│
└─────────────────────────────────────────────────────────────┘
```

## Design System

### Colors (Terminal Theme)
```css
:root {
  --bg-dark: #0a0a0f;
  --bg-surface: #111118;
  --border: #2a2a3a;
  --text: #e0e0e0;
  --text-muted: #6b6b7b;
  --cyan: #00d4ff;
  --green: #00ff88;
  --yellow: #ffcc00;
  --red: #ff4444;
  --purple: #a855f7;
}
```

### Typography
```css
font-family: 'JetBrains Mono', 'Fira Code', monospace;
font-size: 14px;
line-height: 1.5;
```

### Components
- **Panel**: Dark card with border, header in cyan
- **Button**: Gradient background, uppercase text
- **Input**: Dark background, cyan focus border
- **Progress**: Gradient fill on dark track
- **Badge**: Small colored label (NEW, URGENT, etc.)

## API Integration

### New Endpoints
```typescript
// Projects
GET /api/projects              // List all hackathons
POST /api/projects            // Create hackathon
GET /api/projects/:id          // Get with tracks, news

// News
GET /api/projects/:id/news     // Get news feed
POST /api/news                // Add news item
PATCH /api/news/:id/read      // Mark as read

// Filters
GET /api/news?projectId=&priority=HIGH&isRead=false
```

## File Structure
```
public/
├── index.html              # Main dashboard
├── css/
│   └── terminal.css       # Terminal theme
├── js/
│   ├── app.js             # Main app
│   ├── api.js             # API client
│   ├── components/
│   │   ├── news.js        # News feed
│   │   ├── deadlines.js    # Countdown timers
│   │   ├── tasks.js       # Task board
│   │   └── team.js        # Team progress
│   └── utils/
│       ├── time.js         // Countdown helpers
│       └── theme.js         // Theme toggle
└── assets/
    └── fonts/
```

## Success Criteria
- [ ] Multi-hackathon dropdown selector
- [ ] News feed with priority badges
- [ ] Live countdown timers
- [ ] Team progress bars
- [ ] Task board with drag-drop
- [ ] pgbot status footer

## Next Steps
→ Implement Phase 5 frontend
→ Add News endpoints to backend

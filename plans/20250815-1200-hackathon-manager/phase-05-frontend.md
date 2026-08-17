# Phase 5: Frontend Dashboard

**Date**: 2026-08-15 | **Priority**: Medium | **Status**: Completed

## Overview
Build a simple dashboard to visualize progress, deadlines, and database health.

## Tech Stack
- Vanilla HTML/CSS/JS or
- React with Vite (optional)

## Pages

### 1. Dashboard (`/`)
- Progress summary cards
- Upcoming deadlines list
- Recent tasks
- DB health indicator (pgbot)

### 2. Resources (`/resources`)
- Resource list with filtering
- Add/edit/delete resources
- Tag-based search

### 3. Deadlines (`/deadlines`)
- Calendar view
- Timeline view
- Priority indicators

### 4. Team (`/team`)
- Team member cards
- Task assignments
- Individual progress bars

## Implementation Steps

### Basic Structure
```
public/
├── index.html
├── resources.html
├── deadlines.html
├── team.html
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── api.js
    └── components/
```

### API Client
```javascript
// js/api.js
const API_BASE = '/api';

export async function fetchResources() {
  const res = await fetch(`${API_BASE}/resources`);
  return res.json();
}
```

## Success Criteria
- [x] Dashboard loads with all widgets
- [x] Can create/edit/delete resources
- [x] Deadlines display with priority colors & live ticking countdown
- [x] Team progress shows completion % and individual breakdown
- [x] DB health badge & pgbot telemetry panel active

## Next Steps
→ [Phase 6: Railway Deploy](phase-06-railway.md)

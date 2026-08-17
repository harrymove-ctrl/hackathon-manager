# term-v0 TUI Frontend Core

## What
Vanilla JavaScript single-page application managing reactive views, modal creation/editing, countdown timers, keyboard shortcuts, and theme palettes.

## Where
- Main HTML shell: `public/index.html` — `tui-nav-bar`, `term-hero`, `tab-overview`, `tab-tracks`, `tab-deadlines`, `tab-tasks`, `tab-resources`, `tab-team`, `tab-observability`, `tab-radio`
- Master styling & design system: `public/css/styles.css` — `:root`, `[data-theme]`, `term-window`, `benchmark-table`
- Application state & render logic: `public/js/app.js` — `state`, `renderAll`, `switchTab`, `setTheme`, `cycleTheme`, `toggleCRT`, `openModal`
- Robust API client with cloud fallback: `public/js/api.js` — `api`, `request`

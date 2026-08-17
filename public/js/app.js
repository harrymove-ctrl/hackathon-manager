import { api } from './api.js';

// Application State
const state = {
  activeTab: 'overview',
  deadlines: [],
  tasks: [],
  resources: [],
  team: [],
  progress: null,
  pgbot: null,
  theme: localStorage.getItem('tui-theme') || 'amber',
  crtEnabled: localStorage.getItem('tui-crt') !== 'false',
  filters: {
    taskAssignee: 'all',
    taskPriority: 'all',
    resourceType: 'all',
    resourceTag: '',
  },
  radio: {
    stations: [],
    filtered: [],
    selectedIndex: -1,
    isPlaying: false,
    audioCtx: null,
    analyser: null,
    sourceNode: null,
    animationFrameId: null,
  },
};

const THEMES = ['amber', 'green', 'cyan', 'slate'];
const RADIO_API_URL = 'https://de1.api.radio-browser.info/json/stations/search?limit=30&order=clickcount&reverse=true';

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper: Format countdown
function formatTimeRemaining(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { label: 'PASSED / CLOSED', isOverdue: true, diff: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let label = '';
  if (days > 0) label += `${days}d `;
  label += `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

  return { label, isOverdue: false, diff };
}

function formatDate(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }) + ' UTC';
}

function showToast(message) {
  const toast = document.getElementById('tui-toast');
  if (!toast) return;
  toast.textContent = `[!] ${message}`;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2800);
}

// Data Fetching
async function fetchAllData() {
  try {
    const [deadlines, tasks, resources, team, progress] = await Promise.all([
      api.getDeadlines().catch(() => []),
      api.getTasks().catch(() => []),
      api.getResources().catch(() => []),
      api.getTeam().catch(() => []),
      api.getProgressSummary().catch(() => null),
    ]);

    state.deadlines = deadlines || [];
    state.tasks = tasks || [];
    state.resources = resources || [];
    state.team = team || [];
    state.progress = progress;

    renderAll();
  } catch (err) {
    console.error('Error syncing data:', err);
  }
}

async function fetchPgbotStats() {
  try {
    const [inspect, indexes, queries, vacuum] = await Promise.all([
      api.getPgbotInspect().catch(() => null),
      api.getPgbotIndexes().catch(() => null),
      api.getPgbotQueries().catch(() => null),
      api.getPgbotVacuum().catch(() => null),
    ]);

    state.pgbot = { inspect, indexes, queries, vacuum };
    renderObservabilityTab();
  } catch (err) {
    console.error('Error fetching pgbot telemetry:', err);
  }
}

// Master Render
function renderAll() {
  renderOverviewTab();
  renderDeadlinesTab();
  renderTasksTab();
  renderResourcesTab();
  renderTeamTab();
}

function renderOverviewTab() {
  const taskCountEl = document.getElementById('stat-tasks-total');
  const taskRateEl = document.getElementById('stat-tasks-rate');
  const deadlinesCountEl = document.getElementById('stat-deadlines-count');
  const resourcesCountEl = document.getElementById('stat-resources-count');
  const teamCountEl = document.getElementById('stat-team-count');

  const totalTasks = state.tasks.length;
  const doneTasks = state.tasks.filter((t) => t.status === 'DONE').length;
  const rate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  if (taskCountEl) taskCountEl.textContent = `${doneTasks}/${totalTasks}`;
  if (taskRateEl) taskRateEl.textContent = `${rate}% sprint completed`;

  const activeDeadlines = state.deadlines.filter((d) => d.status !== 'COMPLETED').length;
  if (deadlinesCountEl) deadlinesCountEl.textContent = activeDeadlines;
  if (resourcesCountEl) resourcesCountEl.textContent = state.resources.length;
  if (teamCountEl) teamCountEl.textContent = state.team.length;

  // Deadlines preview
  const overviewDeadlinesList = document.getElementById('overview-deadlines-list');
  if (overviewDeadlinesList) {
    if (state.deadlines.length === 0) {
      overviewDeadlinesList.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--tui-text-dim);">No deadlines configured. Use [+ DEADLINE] to add.</td></tr>`;
    } else {
      const topDeadlines = [...state.deadlines]
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 4);

      overviewDeadlinesList.innerHTML = topDeadlines
        .map((d) => {
          const { label, isOverdue } = formatTimeRemaining(d.dueDate);
          const priorityColor =
            d.priority === 'CRITICAL' ? 'var(--tui-red)' : d.priority === 'HIGH' ? 'var(--tui-accent)' : 'inherit';

          return `
            <tr>
              <td><strong style="color:var(--tui-text-highlight);">${escapeHtml(d.title)}</strong></td>
              <td style="color:${priorityColor}; font-weight:700;">[${d.priority}]</td>
              <td style="color:${isOverdue ? 'var(--tui-red)' : 'var(--tui-accent)'}; font-weight:600;">${d.status === 'COMPLETED' ? 'COMPLETED' : label}</td>
              <td style="color:var(--tui-text-dim);">${escapeHtml(d.assignedTo || 'Squad')}</td>
            </tr>
          `;
        })
        .join('');
    }
  }

  // Active Tasks preview
  const overviewTasksList = document.getElementById('overview-tasks-list');
  if (overviewTasksList) {
    const activeTasks = state.tasks.filter((t) => t.status !== 'DONE').slice(0, 5);
    if (activeTasks.length === 0) {
      overviewTasksList.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--tui-text-dim);">All sprint deliverables completed!</td></tr>`;
    } else {
      overviewTasksList.innerHTML = activeTasks
        .map(
          (t) => `
            <tr>
              <td><strong style="color:var(--tui-text-highlight);">${escapeHtml(t.title)}</strong></td>
              <td style="color:var(--tui-text-dim);">${escapeHtml(t.assignee?.name || 'Unassigned')}</td>
              <td><span class="diff-pill-good">${t.status}</span></td>
              <td>
                <button class="btn-term btn-term-sm" onclick="advanceTaskStatus('${t.id}', '${t.status}')">
                  ${t.status === 'TODO' ? 'START ➔' : 'COMPLETE ✓'}
                </button>
              </td>
            </tr>
          `
        )
        .join('');
    }
  }
}

function renderDeadlinesTab() {
  const container = document.getElementById('deadlines-container');
  if (!container) return;

  if (state.deadlines.length === 0) {
    container.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--tui-text-dim);">No deadlines configured.</td></tr>`;
    return;
  }

  const sorted = [...state.deadlines].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  container.innerHTML = sorted
    .map((d, index) => {
      const { label, isOverdue } = formatTimeRemaining(d.dueDate);
      const priorityColor =
        d.priority === 'CRITICAL' ? 'var(--tui-red)' : d.priority === 'HIGH' ? 'var(--tui-accent)' : 'inherit';

      return `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong style="color:var(--tui-text-highlight);">${escapeHtml(d.title)}</strong><br>
            <span style="font-size:0.75rem; color:var(--tui-text-dim);">${escapeHtml(d.description || '')}</span>
          </td>
          <td style="font-size:0.75rem;">${formatDate(d.dueDate)}</td>
          <td style="font-weight:700; color:${isOverdue ? 'var(--tui-red)' : 'var(--tui-accent)'};">${d.status === 'COMPLETED' ? 'DONE' : label}</td>
          <td style="color:${priorityColor}; font-weight:700;">[${d.priority}]</td>
          <td><span class="diff-pill-good">${d.status}</span></td>
          <td style="color:var(--tui-text-dim);">${escapeHtml(d.assignedTo || 'Squad')}</td>
          <td style="text-align:right;">
            <button class="btn-term btn-term-sm" onclick="openModal('deadline', '${d.id}')">EDIT</button>
            <button class="btn-term btn-term-sm btn-term-danger" onclick="deleteDeadline('${d.id}')">DEL</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderTasksTab() {
  const colTodo = document.getElementById('kanban-col-todo');
  const colProgress = document.getElementById('kanban-col-in-progress');
  const colDone = document.getElementById('kanban-col-done');

  const countTodo = document.getElementById('count-todo');
  const countProgress = document.getElementById('count-in-progress');
  const countDone = document.getElementById('count-done');

  if (!colTodo || !colProgress || !colDone) return;

  // Filter tasks
  let filtered = state.tasks;
  if (state.filters.taskAssignee !== 'all') {
    filtered = filtered.filter((t) => t.assigneeId === state.filters.taskAssignee);
  }
  if (state.filters.taskPriority !== 'all') {
    filtered = filtered.filter((t) => t.priority === state.filters.taskPriority);
  }

  const todoTasks = filtered.filter((t) => t.status === 'TODO');
  const progressTasks = filtered.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = filtered.filter((t) => t.status === 'DONE');

  if (countTodo) countTodo.textContent = todoTasks.length;
  if (countProgress) countProgress.textContent = progressTasks.length;
  if (countDone) countDone.textContent = doneTasks.length;

  const renderCard = (t) => `
    <div class="task-card" onclick="openModal('task', '${t.id}')">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.4rem;">
        <strong style="color:var(--tui-text-highlight); font-size:0.85rem; line-height:1.3;">${escapeHtml(t.title)}</strong>
        <span style="font-size:0.7rem; font-weight:700; color:${t.priority === 'CRITICAL' ? 'var(--tui-red)' : t.priority === 'HIGH' ? 'var(--tui-accent)' : 'inherit'};">[${t.priority}]</span>
      </div>
      <p style="font-size:0.75rem; color:var(--tui-text-dim); line-height:1.4;">${escapeHtml(t.description || '')}</p>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:var(--tui-text-dim); border-top:1px dashed var(--tui-border); padding-top:0.4rem; margin-top:0.2rem;">
        <span>👤 ${escapeHtml(t.assignee?.name || 'Unassigned')}</span>
        <button class="btn-term btn-term-sm" onclick="event.stopPropagation(); advanceTaskStatus('${t.id}', '${t.status}')">
          ${t.status === 'TODO' ? 'START ➔' : t.status === 'IN_PROGRESS' ? 'DONE ✓' : 'REOPEN ↺'}
        </button>
      </div>
    </div>
  `;

  colTodo.innerHTML = todoTasks.length ? todoTasks.map(renderCard).join('') : '<div style="color:var(--tui-text-muted); font-size:0.75rem; text-align:center; padding:1rem;">No tasks</div>';
  colProgress.innerHTML = progressTasks.length ? progressTasks.map(renderCard).join('') : '<div style="color:var(--tui-text-muted); font-size:0.75rem; text-align:center; padding:1rem;">No active tasks</div>';
  colDone.innerHTML = doneTasks.length ? doneTasks.map(renderCard).join('') : '<div style="color:var(--tui-text-muted); font-size:0.75rem; text-align:center; padding:1rem;">No completed tasks</div>';

  // Populate Assignee Filter dropdown
  const assigneeSelect = document.getElementById('task-assignee-filter');
  if (assigneeSelect && assigneeSelect.options.length <= 1) {
    state.team.forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      assigneeSelect.appendChild(opt);
    });
  }
}

function renderResourcesTab() {
  const container = document.getElementById('resources-container');
  if (!container) return;

  let filtered = state.resources;
  if (state.filters.resourceType !== 'all') {
    filtered = filtered.filter((r) => r.type === state.filters.resourceType);
  }
  if (state.filters.resourceTag.trim()) {
    const tag = state.filters.resourceTag.toLowerCase().trim();
    filtered = filtered.filter((r) => r.tags?.some((t) => t.toLowerCase().includes(tag)));
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--tui-text-dim); padding:2rem;">No matching resources found.</div>`;
    return;
  }

  container.innerHTML = filtered
    .map(
      (r) => `
      <div class="category-card" onclick="openModal('resource', '${r.id}')" style="cursor:pointer;">
        <div class="category-card-header">
          <span style="font-size:0.72rem; font-weight:700; color:var(--tui-accent);">[ ${r.type} ]</span>
          <span style="font-size:0.7rem; color:var(--tui-text-dim);">By ${escapeHtml(r.createdBy || 'Lead')}</span>
        </div>
        <strong style="color:var(--tui-text-highlight); font-size:0.92rem;">${escapeHtml(r.title)}</strong>
        <p style="font-size:0.78rem; color:var(--tui-text-dim); line-height:1.4;">${escapeHtml(r.description || '')}</p>
        ${r.url ? `<a href="${r.url}" target="_blank" rel="noopener noreferrer" class="btn-term btn-term-sm" onclick="event.stopPropagation();" style="width:fit-content; margin-top:0.4rem;">VISIT LINK ↗</a>` : ''}
        <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:auto; padding-top:0.5rem;">
          ${(r.tags || []).map((tag) => `<span class="tui-beta-badge" style="font-size:8px;">#${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
    `
    )
    .join('');
}

function renderTeamTab() {
  const container = document.getElementById('team-container');
  if (!container) return;

  if (state.team.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--tui-text-dim); padding:2rem;">No squad members added yet.</div>`;
    return;
  }

  container.innerHTML = state.team
    .map((m) => {
      const assignedTasks = state.tasks.filter((t) => t.assigneeId === m.id);
      const done = assignedTasks.filter((t) => t.status === 'DONE').length;
      return `
        <div class="category-card">
          <div class="category-card-header">
            <span style="font-size:0.75rem; font-weight:700; color:var(--tui-accent);">[ ENGINEER ]</span>
            <span class="diff-pill-good">${done}/${assignedTasks.length} TASKS</span>
          </div>
          <strong style="color:var(--tui-text-highlight); font-size:1.1rem;">${escapeHtml(m.name)}</strong>
          <span style="font-size:0.8rem; color:var(--tui-text-dim);">${escapeHtml(m.role || 'Member')}</span>
          <span style="font-size:0.75rem; color:var(--tui-text-muted); font-family:var(--font-mono);">${escapeHtml(m.email)}</span>
          <div style="display:flex; gap:0.4rem; margin-top:0.5rem;">
            <button class="btn-term btn-term-sm" onclick="openModal('team', '${m.id}')">EDIT</button>
            <button class="btn-term btn-term-sm btn-term-danger" onclick="deleteTeamMember('${m.id}')">REMOVE</button>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderObservabilityTab() {
  if (!state.pgbot) return;

  const { inspect, queries, vacuum } = state.pgbot;

  const versionEl = document.getElementById('pg-metric-version');
  const sizeEl = document.getElementById('pg-metric-size');
  const cacheEl = document.getElementById('pg-metric-cache');
  const connsEl = document.getElementById('pg-metric-conns');

  if (inspect?.database) {
    if (versionEl) versionEl.textContent = inspect.database.version?.split(' on ')[0] || 'PostgreSQL 18.6';
    if (sizeEl) sizeEl.textContent = inspect.database.size || '32 MB';
    if (cacheEl) cacheEl.textContent = inspect.database.cacheHitRatio || '100%';
  }
  if (inspect?.connections && connsEl) {
    connsEl.textContent = `${inspect.connections.active} active / ${inspect.connections.idle} idle`;
  }

  // Active queries table
  const queriesBody = document.getElementById('pg-queries-body');
  if (queriesBody) {
    const list = queries?.queries || [];
    if (list.length === 0) {
      queriesBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--tui-text-dim);">No slow or stuck queries detected. Database is optimal.</td></tr>`;
    } else {
      queriesBody.innerHTML = list
        .map(
          (q) => `
          <tr>
            <td>${q.pid}</td>
            <td>${escapeHtml(q.username)}</td>
            <td><span class="diff-pill-good">${q.state}</span></td>
            <td>${q.duration || '<1ms'}</td>
            <td style="font-family:var(--font-mono); max-width:300px; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(q.query_snippet)}</td>
          </tr>
        `
        )
        .join('');
    }
  }

  // Table vacuum body
  const vacuumBody = document.getElementById('pg-vacuum-body');
  if (vacuumBody) {
    const tables = vacuum?.tables || [];
    if (tables.length === 0) {
      vacuumBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--tui-text-dim);">All tables clean. Autovacuum active.</td></tr>`;
    } else {
      vacuumBody.innerHTML = tables
        .map(
          (tb) => `
          <tr>
            <td><strong>${escapeHtml(tb.table_name)}</strong></td>
            <td>${tb.live_tuples}</td>
            <td>${tb.dead_tuples}</td>
            <td><span class="diff-pill-good">${tb.dead_tuple_ratio}%</span></td>
          </tr>
        `
        )
        .join('');
    }
  }
}

// Tab Switching
function switchTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll('.tui-nav-link').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  document.querySelectorAll('.tui-view').forEach((view) => {
    view.classList.toggle('active', view.id === `tab-${tabId}`);
  });

  if (tabId === 'observability') {
    fetchPgbotStats();
  } else if (tabId === 'radio' && state.radio.stations.length === 0) {
    fetchRadioStations();
  }
}

// Theme & CRT Controls
function setTheme(name) {
  state.theme = name;
  document.documentElement.setAttribute('data-theme', name);
  localStorage.setItem('tui-theme', name);
  const ind = document.getElementById('theme-indicator');
  if (ind) ind.textContent = name.toUpperCase();
}

function cycleTheme() {
  const currentIndex = THEMES.indexOf(state.theme);
  const nextIndex = (currentIndex + 1) % THEMES.length;
  setTheme(THEMES[nextIndex]);
  showToast(`Palette switched to ${THEMES[nextIndex].toUpperCase()}`);
}

function toggleCRT() {
  state.crtEnabled = !state.crtEnabled;
  const overlay = document.getElementById('crt-overlay');
  const btn = document.getElementById('btn-crt-toggle');
  if (overlay) overlay.classList.toggle('disabled', !state.crtEnabled);
  if (btn) btn.textContent = `CRT: ${state.crtEnabled ? 'ON' : 'OFF'}`;
  localStorage.setItem('tui-crt', String(state.crtEnabled));
}

// Seed Reset Action
async function triggerSeedReset() {
  if (!confirm('Re-seed database with BNB Chain Smart Money Era official tracks and data?')) return;
  try {
    showToast('Triggering database re-seed...');
    await api.triggerSeed();
    showToast('Seed complete! Reloading state...');
    await fetchAllData();
  } catch (err) {
    showToast(`Error seeding: ${err.message}`);
  }
}

// Clipboard Helper
function copySnippet(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.textContent || el.innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Snippet copied to clipboard!');
  });
}

// Task Status Advance
async function advanceTaskStatus(taskId, currentStatus) {
  let nextStatus = 'IN_PROGRESS';
  if (currentStatus === 'TODO') nextStatus = 'IN_PROGRESS';
  else if (currentStatus === 'IN_PROGRESS') nextStatus = 'DONE';
  else if (currentStatus === 'DONE') nextStatus = 'TODO';

  try {
    await api.updateTask(taskId, { status: nextStatus });
    showToast(`Task moved to ${nextStatus}`);
    await fetchAllData();
  } catch (err) {
    showToast(`Failed to update task: ${err.message}`);
  }
}

// Delete actions
async function deleteDeadline(id) {
  if (!confirm('Delete this milestone?')) return;
  try {
    await api.deleteDeadline(id);
    showToast('Milestone deleted');
    await fetchAllData();
  } catch (err) {
    showToast(err.message);
  }
}

async function deleteTeamMember(id) {
  if (!confirm('Remove this member?')) return;
  try {
    await api.deleteTeam(id);
    showToast('Member removed');
    await fetchAllData();
  } catch (err) {
    showToast(err.message);
  }
}

// Radio Browser Integration
async function fetchRadioStations() {
  const tbody = document.getElementById('radio-table-body');
  if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--tui-text-dim);">Connecting to Radio Browser API...</td></tr>`;

  try {
    const res = await fetch(RADIO_API_URL);
    const data = await res.json();
    state.radio.stations = data || [];
    state.radio.filtered = [...state.radio.stations];

    const countEl = document.getElementById('radio-station-count');
    if (countEl) countEl.textContent = `[ ${state.radio.stations.length} STATIONS ]`;

    // Populate country filter
    const countryFilter = document.getElementById('radio-country-filter');
    if (countryFilter && countryFilter.options.length <= 1) {
      const countries = Array.from(new Set(state.radio.stations.map((s) => s.country).filter(Boolean))).sort();
      countries.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        countryFilter.appendChild(opt);
      });
    }

    renderRadioTable();
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--tui-red);">Failed to connect to Radio API. Check network.</td></tr>`;
  }
}

function renderRadioTable() {
  const tbody = document.getElementById('radio-table-body');
  if (!tbody) return;

  if (state.radio.filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--tui-text-dim);">No stations found.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.radio.filtered
    .map(
      (s, index) => `
      <tr onclick="selectRadioStation(${index})" style="cursor:pointer;" class="${state.radio.selectedIndex === index ? 'selected' : ''}">
        <td>${index + 1}</td>
        <td><strong style="color:var(--tui-text-highlight);">${escapeHtml(s.name)}</strong></td>
        <td style="color:var(--tui-text-dim);">${escapeHtml(s.country || 'Global')}</td>
        <td><span class="diff-pill-good">${s.codec || 'MP3'}</span></td>
        <td>${s.bitrate ? s.bitrate + 'k' : '--'}</td>
        <td style="color:var(--tui-accent);">${s.clickcount || 0}</td>
      </tr>
    `
    )
    .join('');
}

function selectRadioStation(index) {
  state.radio.selectedIndex = index;
  renderRadioTable();

  const station = state.radio.filtered[index];
  if (!station) return;

  const urlDisplay = document.getElementById('radio-stream-url-display');
  const indicator = document.getElementById('radio-player-indicator');
  const audio = document.getElementById('tui-radio-audio');

  if (urlDisplay) urlDisplay.textContent = station.url_resolved || station.url;
  if (indicator) indicator.textContent = `[ SELECTED: ${station.name} ]`;

  if (audio) {
    audio.src = station.url_resolved || station.url;
    audio.play().then(() => {
      state.radio.isPlaying = true;
      const playBtn = document.getElementById('btn-radio-play');
      if (playBtn) playBtn.textContent = '⏸ PAUSE';
      if (indicator) indicator.textContent = `[ BROADCASTING LIVE: ${station.name} ]`;
      setupAudioVisualizer();
    }).catch(() => {
      showToast('Autoplay blocked or stream format unsupported. Click Play to start.');
    });
  }
}

function toggleRadioPlay() {
  const audio = document.getElementById('tui-radio-audio');
  const playBtn = document.getElementById('btn-radio-play');
  if (!audio) return;

  if (audio.paused) {
    if (state.radio.selectedIndex === -1 && state.radio.filtered.length > 0) {
      selectRadioStation(0);
      return;
    }
    audio.play();
    state.radio.isPlaying = true;
    if (playBtn) playBtn.textContent = '⏸ PAUSE';
    setupAudioVisualizer();
  } else {
    audio.pause();
    state.radio.isPlaying = false;
    if (playBtn) playBtn.textContent = '▶ PLAY';
  }
}

function stopRadioStream() {
  const audio = document.getElementById('tui-radio-audio');
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  state.radio.isPlaying = false;
  const playBtn = document.getElementById('btn-radio-play');
  if (playBtn) playBtn.textContent = '▶ PLAY';
}

function playRandomRadioStation() {
  if (state.radio.filtered.length === 0) return;
  const randomIndex = Math.floor(Math.random() * state.radio.filtered.length);
  selectRadioStation(randomIndex);
}

function setRadioVolume(val) {
  const audio = document.getElementById('tui-radio-audio');
  if (audio) audio.volume = parseFloat(val);
  const label = document.getElementById('radio-vol-label');
  if (label) label.textContent = `${Math.round(val * 100)}%`;
}

function copyRadioStreamUrl() {
  const urlDisplay = document.getElementById('radio-stream-url-display');
  if (!urlDisplay) return;
  navigator.clipboard.writeText(urlDisplay.textContent.trim()).then(() => {
    showToast('Direct audio stream URL copied!');
  });
}

function openRawRadioStream() {
  const station = state.radio.filtered[state.radio.selectedIndex];
  if (station) window.open(station.url_resolved || station.url, '_blank');
}

function copyRadioCurl() {
  const station = state.radio.filtered[state.radio.selectedIndex];
  if (!station) return;
  const cmd = `curl -N -s "${station.url_resolved || station.url}" | ffplay -nodisp -autoexit -`;
  navigator.clipboard.writeText(cmd).then(() => {
    showToast('Curl playback command copied!');
  });
}

function setupAudioVisualizer() {
  const canvas = document.getElementById('radio-canvas-visualizer');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function draw() {
    state.radio.animationFrameId = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = state.radio.isPlaying ? 'var(--tui-accent)' : 'var(--tui-text-muted)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const width = canvas.width;
    const height = canvas.height;
    const sliceWidth = width / 64;
    let x = 0;

    for (let i = 0; i < 64; i++) {
      const v = state.radio.isPlaying ? (Math.sin(i * 0.3 + Date.now() * 0.005) * 0.5 + 0.5) : 0.5;
      const y = v * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.stroke();
  }

  if (!state.radio.animationFrameId) draw();
}

// Universal Modal Handling
function openModal(type, itemId = null) {
  const modal = document.getElementById('universal-modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const saveBtn = document.getElementById('modal-save-btn');
  if (!modal || !body) return;

  let html = '';
  if (type === 'task') {
    const task = itemId ? state.tasks.find((t) => t.id === itemId) : null;
    title.textContent = task ? '> EDIT SPRINT TASK' : '> NEW SPRINT TASK';
    html = `
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">TASK TITLE</label>
      <input type="text" id="m-task-title" class="tui-input" value="${escapeHtml(task?.title || '')}" placeholder="Implement feature...">
      
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">DESCRIPTION</label>
      <textarea id="m-task-desc" class="tui-textarea" placeholder="Detailed technical scope...">${escapeHtml(task?.description || '')}</textarea>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
        <div>
          <label style="font-size:0.75rem; color:var(--tui-text-dim);">PRIORITY</label>
          <select id="m-task-priority" class="tui-select">
            <option value="CRITICAL" ${task?.priority === 'CRITICAL' ? 'selected' : ''}>CRITICAL</option>
            <option value="HIGH" ${task?.priority === 'HIGH' ? 'selected' : ''}>HIGH</option>
            <option value="MEDIUM" ${!task || task?.priority === 'MEDIUM' ? 'selected' : ''}>MEDIUM</option>
            <option value="LOW" ${task?.priority === 'LOW' ? 'selected' : ''}>LOW</option>
          </select>
        </div>
        <div>
          <label style="font-size:0.75rem; color:var(--tui-text-dim);">ASSIGNEE</label>
          <select id="m-task-assignee" class="tui-select">
            <option value="">Unassigned</option>
            ${state.team.map((m) => `<option value="${m.id}" ${task?.assigneeId === m.id ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('')}
          </select>
        </div>
      </div>
    `;
    saveBtn.onclick = () => saveTask(itemId);
  } else if (type === 'deadline') {
    const deadline = itemId ? state.deadlines.find((d) => d.id === itemId) : null;
    title.textContent = deadline ? '> EDIT MILESTONE' : '> NEW MILESTONE';
    const dueFormatted = deadline ? new Date(deadline.dueDate).toISOString().slice(0, 16) : new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16);
    html = `
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">MILESTONE TITLE</label>
      <input type="text" id="m-dl-title" class="tui-input" value="${escapeHtml(deadline?.title || '')}" placeholder="Hard submission deadline...">
      
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">DESCRIPTION</label>
      <textarea id="m-dl-desc" class="tui-textarea" placeholder="Checklist and deliverables...">${escapeHtml(deadline?.description || '')}</textarea>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
        <div>
          <label style="font-size:0.75rem; color:var(--tui-text-dim);">DUE DATE (UTC)</label>
          <input type="datetime-local" id="m-dl-date" class="tui-input" value="${dueFormatted}">
        </div>
        <div>
          <label style="font-size:0.75rem; color:var(--tui-text-dim);">PRIORITY</label>
          <select id="m-dl-priority" class="tui-select">
            <option value="CRITICAL" ${deadline?.priority === 'CRITICAL' ? 'selected' : ''}>CRITICAL</option>
            <option value="HIGH" ${deadline?.priority === 'HIGH' ? 'selected' : ''}>HIGH</option>
            <option value="MEDIUM" ${!deadline || deadline?.priority === 'MEDIUM' ? 'selected' : ''}>MEDIUM</option>
            <option value="LOW" ${deadline?.priority === 'LOW' ? 'selected' : ''}>LOW</option>
          </select>
        </div>
      </div>
    `;
    saveBtn.onclick = () => saveDeadline(itemId);
  } else if (type === 'resource') {
    const res = itemId ? state.resources.find((r) => r.id === itemId) : null;
    title.textContent = res ? '> EDIT RESOURCE' : '> NEW RESOURCE';
    html = `
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">TITLE</label>
      <input type="text" id="m-res-title" class="tui-input" value="${escapeHtml(res?.title || '')}" placeholder="8004scan Docs...">
      
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">URL (OPTIONAL)</label>
      <input type="url" id="m-res-url" class="tui-input" value="${escapeHtml(res?.url || '')}" placeholder="https://...">
      
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">TYPE & TAGS</label>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
        <select id="m-res-type" class="tui-select">
          <option value="LINK" ${res?.type === 'LINK' ? 'selected' : ''}>LINK</option>
          <option value="DOCUMENT" ${res?.type === 'DOCUMENT' ? 'selected' : ''}>DOCUMENT</option>
          <option value="NOTE" ${res?.type === 'NOTE' ? 'selected' : ''}>NOTE</option>
        </select>
        <input type="text" id="m-res-tags" class="tui-input" value="${escapeHtml((res?.tags || []).join(', '))}" placeholder="api, bnb, mcp">
      </div>
      
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">DESCRIPTION / CONTENT</label>
      <textarea id="m-res-desc" class="tui-textarea" placeholder="Key notes and specs...">${escapeHtml(res?.description || res?.content || '')}</textarea>
    `;
    saveBtn.onclick = () => saveResource(itemId);
  } else if (type === 'team') {
    const member = itemId ? state.team.find((m) => m.id === itemId) : null;
    title.textContent = member ? '> EDIT SQUAD MEMBER' : '> ADD SQUAD MEMBER';
    html = `
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">FULL NAME</label>
      <input type="text" id="m-team-name" class="tui-input" value="${escapeHtml(member?.name || '')}" placeholder="Harry Phan">
      
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">EMAIL</label>
      <input type="email" id="m-team-email" class="tui-input" value="${escapeHtml(member?.email || '')}" placeholder="engineer@bnbchain.org">
      
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">ROLE</label>
      <input type="text" id="m-team-role" class="tui-input" value="${escapeHtml(member?.role || '')}" placeholder="Lead Architect">
    `;
    saveBtn.onclick = () => saveTeamMember(itemId);
  }

  body.innerHTML = html;
  modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('universal-modal');
  if (modal) modal.classList.remove('open');
}

async function saveTask(id) {
  const title = document.getElementById('m-task-title')?.value.trim();
  const description = document.getElementById('m-task-desc')?.value.trim();
  const priority = document.getElementById('m-task-priority')?.value;
  const assigneeId = document.getElementById('m-task-assignee')?.value || null;

  if (!title) return alert('Title required');

  try {
    if (id) await api.updateTask(id, { title, description, priority, assigneeId });
    else await api.createTask({ title, description, priority, assigneeId });
    closeModal();
    showToast('Task saved');
    await fetchAllData();
  } catch (err) {
    alert(err.message);
  }
}

async function saveDeadline(id) {
  const title = document.getElementById('m-dl-title')?.value.trim();
  const description = document.getElementById('m-dl-desc')?.value.trim();
  const priority = document.getElementById('m-dl-priority')?.value;
  const dueDate = document.getElementById('m-dl-date')?.value;

  if (!title || !dueDate) return alert('Title and date required');

  try {
    if (id) await api.updateDeadline(id, { title, description, priority, dueDate: new Date(dueDate).toISOString() });
    else await api.createDeadline({ title, description, priority, dueDate: new Date(dueDate).toISOString() });
    closeModal();
    showToast('Milestone saved');
    await fetchAllData();
  } catch (err) {
    alert(err.message);
  }
}

async function saveResource(id) {
  const title = document.getElementById('m-res-title')?.value.trim();
  const url = document.getElementById('m-res-url')?.value.trim() || null;
  const type = document.getElementById('m-res-type')?.value;
  const tags = document.getElementById('m-res-tags')?.value.split(',').map((s) => s.trim()).filter(Boolean);
  const description = document.getElementById('m-res-desc')?.value.trim();

  if (!title) return alert('Title required');

  try {
    if (id) await api.updateResource(id, { title, url, type, tags, description });
    else await api.createResource({ title, url, type, tags, description, createdBy: 'Lead' });
    closeModal();
    showToast('Resource saved');
    await fetchAllData();
  } catch (err) {
    alert(err.message);
  }
}

async function saveTeamMember(id) {
  const name = document.getElementById('m-team-name')?.value.trim();
  const email = document.getElementById('m-team-email')?.value.trim();
  const role = document.getElementById('m-team-role')?.value.trim();

  if (!name || !email) return alert('Name and email required');

  try {
    if (id) await api.updateTeam(id, { name, email, role });
    else await api.createTeam({ name, email, role });
    closeModal();
    showToast('Squad member saved');
    await fetchAllData();
  } catch (err) {
    alert(err.message);
  }
}

// Global Exports & Window Binding
window.switchTab = switchTab;
window.setTheme = setTheme;
window.cycleTheme = cycleTheme;
window.toggleCRT = toggleCRT;
window.triggerSeedReset = triggerSeedReset;
window.copySnippet = copySnippet;
window.advanceTaskStatus = advanceTaskStatus;
window.deleteDeadline = deleteDeadline;
window.deleteTeamMember = deleteTeamMember;
window.openModal = openModal;
window.closeModal = closeModal;
window.fetchPgbotStats = fetchPgbotStats;
window.fetchRadioStations = fetchRadioStations;
window.selectRadioStation = selectRadioStation;
window.toggleRadioPlay = toggleRadioPlay;
window.stopRadioStream = stopRadioStream;
window.playRandomRadioStation = playRandomRadioStation;
window.setRadioVolume = setRadioVolume;
window.copyRadioStreamUrl = copyRadioStreamUrl;
window.openRawRadioStream = openRawRadioStream;
window.copyRadioCurl = copyRadioCurl;

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  setTheme(state.theme);
  const overlay = document.getElementById('crt-overlay');
  const crtBtn = document.getElementById('btn-crt-toggle');
  if (overlay) overlay.classList.toggle('disabled', !state.crtEnabled);
  if (crtBtn) crtBtn.textContent = `CRT: ${state.crtEnabled ? 'ON' : 'OFF'}`;

  // Nav button listeners
  document.querySelectorAll('.tui-nav-link').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Filter change listeners
  const assigneeFilter = document.getElementById('task-assignee-filter');
  const priorityFilter = document.getElementById('task-priority-filter');
  const resourceTypeFilter = document.getElementById('resource-type-filter');
  const resourceTagFilter = document.getElementById('resource-tag-filter');

  if (assigneeFilter) {
    assigneeFilter.addEventListener('change', (e) => {
      state.filters.taskAssignee = e.target.value;
      renderTasksTab();
    });
  }
  if (priorityFilter) {
    priorityFilter.addEventListener('change', (e) => {
      state.filters.taskPriority = e.target.value;
      renderTasksTab();
    });
  }
  if (resourceTypeFilter) {
    resourceTypeFilter.addEventListener('change', (e) => {
      state.filters.resourceType = e.target.value;
      renderResourcesTab();
    });
  }
  if (resourceTagFilter) {
    resourceTagFilter.addEventListener('input', (e) => {
      state.filters.resourceTag = e.target.value;
      renderResourcesTab();
    });
  }

  // CLI Bar Input handler
  const cliInput = document.getElementById('tui-cli-input');
  if (cliInput) {
    cliInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = cliInput.value.trim().toLowerCase();
        cliInput.value = '';
        if (cmd === '1' || cmd === 'overview') switchTab('overview');
        else if (cmd === '2' || cmd === 'tracks') switchTab('tracks');
        else if (cmd === '3' || cmd === 'deadlines') switchTab('deadlines');
        else if (cmd === '4' || cmd === 'tasks') switchTab('tasks');
        else if (cmd === '5' || cmd === 'resources') switchTab('resources');
        else if (cmd === '6' || cmd === 'team') switchTab('team');
        else if (cmd === '7' || cmd === 'pgbot') switchTab('observability');
        else if (cmd === '8' || cmd === 'radio') switchTab('radio');
        else if (cmd === 'crt') toggleCRT();
        else if (cmd.startsWith('theme ')) setTheme(cmd.split(' ')[1]);
        else if (cmd === 'seed') triggerSeedReset();
        else if (cmd === 'task') openModal('task');
        else if (cmd === 'deadline') openModal('deadline');
        else if (cmd === '?') showToast('Commands: 1-8, tracks, report, tasks, deadlines, theme [amber|green|cyan|slate], crt, seed');
        else showToast(`Unknown command: ${cmd}`);
      }
    });
  }

  // Keyboard shortcut listeners (1-8, T, ESC)
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      if (e.key === 'Escape') closeModal();
      return;
    }
    if (e.key >= '1' && e.key <= '8') {
      const tabs = ['overview', 'tracks', 'deadlines', 'tasks', 'resources', 'team', 'observability', 'radio'];
      switchTab(tabs[parseInt(e.key) - 1]);
    } else if (e.key.toLowerCase() === 't') {
      cycleTheme();
    } else if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Initial Data Fetch
  fetchAllData();

  // Ticker interval for countdowns
  setInterval(() => {
    renderOverviewTab();
    renderDeadlinesTab();
  }, 1000);
});

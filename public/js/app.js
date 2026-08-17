import { api } from './api.js';
import { AnimateText } from './animateText.js';
import { FlexboxLabs } from './flexboxLabs.js';

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
    taskAssignee: 'ALL',
    taskPriority: 'ALL',
  },
  radio: {
    stations: [],
    filtered: [],
    selectedIndex: 0,
    isPlaying: false,
    audioCtx: null,
    analyser: null,
    animationFrameId: null,
    audioEl: null,
  },
};

const THEMES = ['amber', 'green', 'cyan', 'slate'];
let flexboxLabInstance = null;

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
    populateAssigneeFilter();
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
  const metricProgress = document.getElementById('metric-progress');
  const metricProgressSub = document.getElementById('metric-progress-sub');
  const metricDeadlines = document.getElementById('metric-deadlines');
  const metricResources = document.getElementById('metric-resources');
  const metricTeam = document.getElementById('metric-team');

  const totalTasks = state.tasks.length;
  const doneTasks = state.tasks.filter((t) => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const rate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  if (metricProgress) metricProgress.textContent = `${doneTasks}/${totalTasks}`;
  if (metricProgressSub) metricProgressSub.textContent = `${rate}% sprint completed`;

  const pendingDeadlines = state.deadlines.filter((d) => d.status !== 'COMPLETED').length;
  if (metricDeadlines) metricDeadlines.textContent = pendingDeadlines;
  if (metricResources) metricResources.textContent = state.resources.length;
  if (metricTeam) metricTeam.textContent = state.team.length;

  // Render overview deadlines list
  const dlList = document.getElementById('overview-deadlines-list');
  if (dlList) {
    if (state.deadlines.length === 0) {
      dlList.innerHTML = `<div style="color:var(--tui-text-dim); font-size:0.8rem;">No milestones scheduled. Click + Milestone to create.</div>`;
    } else {
      dlList.innerHTML = `
        <table class="benchmark-table">
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Priority</th>
              <th>Countdown</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${state.deadlines.slice(0, 4).map(d => {
              const countdown = formatTimeRemaining(d.dueDate);
              return `
                <tr>
                  <td><strong>${escapeHtml(d.title)}</strong></td>
                  <td><span class="diff-pill-good">[${d.priority}]</span></td>
                  <td style="color:${countdown.isOverdue ? 'var(--tui-green)' : 'var(--tui-accent)'}; font-weight:700;">
                    ${countdown.isOverdue ? 'COMPLETED' : countdown.label}
                  </td>
                  <td>
                    <button class="btn-term btn-term-sm" onclick="window.editDeadline('${d.id}')">EDIT</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }
  }

  // Render overview tasks list
  const taskList = document.getElementById('overview-tasks-list');
  if (taskList) {
    if (state.tasks.length === 0) {
      taskList.innerHTML = `<div style="color:var(--tui-text-dim); font-size:0.8rem;">No deliverables registered. Click + TASK to add.</div>`;
    } else {
      taskList.innerHTML = `
        <table class="benchmark-table">
          <thead>
            <tr>
              <th>Deliverable</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${state.tasks.slice(0, 4).map(t => {
              const assignee = state.team.find(m => m.id === t.assigneeId)?.name || 'Unassigned';
              return `
                <tr>
                  <td><strong>${escapeHtml(t.title)}</strong></td>
                  <td style="color:var(--tui-text-dim);">${escapeHtml(assignee)}</td>
                  <td><span class="diff-pill-good">${t.status}</span></td>
                  <td>
                    <button class="btn-term btn-term-sm btn-term-primary" onclick="window.advanceTaskStatus('${t.id}')">ADVANCE →</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }
  }
}

function renderDeadlinesTab() {
  const container = document.getElementById('deadlines-container');
  if (!container) return;

  if (state.deadlines.length === 0) {
    container.innerHTML = `<div style="padding:1rem; color:var(--tui-text-dim);">No milestones found. Click + MILESTONE above.</div>`;
    return;
  }

  container.innerHTML = state.deadlines.map(d => {
    const countdown = formatTimeRemaining(d.dueDate);
    return `
      <div class="category-card" style="display:flex; flex-direction:row; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem;">
        <div style="flex:1; min-width:260px;">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <span class="diff-pill-good">[${d.priority}]</span>
            <strong style="color:var(--tui-text-highlight); font-size:0.95rem;">${escapeHtml(d.title)}</strong>
          </div>
          <p style="font-size:0.78rem; color:var(--tui-text-dim); line-height:1.4;">${escapeHtml(d.description || 'No additional details')}</p>
          <div style="font-size:0.72rem; color:var(--tui-text-muted); margin-top:0.35rem;">Due: ${formatDate(d.dueDate)}</div>
        </div>

        <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:0.4rem;">
          <div style="font-size:1.1rem; font-family:var(--font-serif); font-weight:700; color:${countdown.isOverdue ? 'var(--tui-green)' : 'var(--tui-accent)'};">
            ${countdown.isOverdue ? '✅ MILESTONE REACHED' : `⏳ ${countdown.label}`}
          </div>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn-term btn-term-sm" onclick="window.editDeadline('${d.id}')">EDIT</button>
            <button class="btn-term btn-term-sm btn-term-danger" onclick="window.deleteDeadline('${d.id}')">DELETE</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderTasksTab() {
  const todoCol = document.getElementById('tasks-todo-list');
  const inProgressCol = document.getElementById('tasks-in-progress-list');
  const completedCol = document.getElementById('tasks-completed-list');

  const countTodo = document.getElementById('count-todo');
  const countInProgress = document.getElementById('count-in-progress');
  const countCompleted = document.getElementById('count-completed');

  if (!todoCol || !inProgressCol || !completedCol) return;

  let filtered = [...state.tasks];
  if (state.filters.taskAssignee !== 'ALL') {
    filtered = filtered.filter(t => t.assigneeId === state.filters.taskAssignee);
  }

  const todos = filtered.filter(t => t.status === 'TODO' || t.status === 'PENDING');
  const inProgress = filtered.filter(t => t.status === 'IN_PROGRESS' || t.status === 'DOING');
  const completed = filtered.filter(t => t.status === 'COMPLETED' || t.status === 'DONE');

  if (countTodo) countTodo.textContent = todos.length;
  if (countInProgress) countInProgress.textContent = inProgress.length;
  if (countCompleted) countCompleted.textContent = completed.length;

  const renderCard = (t) => {
    const assignee = state.team.find(m => m.id === t.assigneeId)?.name || 'Unassigned';
    return `
      <div class="task-card" onclick="window.editTask('${t.id}')">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <span class="diff-pill-good" style="font-size:0.65rem;">${t.priority}</span>
          <span style="font-size:0.7rem; color:var(--tui-text-muted);">${escapeHtml(assignee)}</span>
        </div>
        <strong style="color:var(--tui-text-highlight); font-size:0.85rem; line-height:1.3;">${escapeHtml(t.title)}</strong>
        <p style="font-size:0.75rem; color:var(--tui-text-dim); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
          ${escapeHtml(t.description || '')}
        </p>
        <div style="display:flex; justify-content:flex-end; gap:0.3rem; margin-top:0.25rem;">
          <button class="btn-term btn-term-sm btn-term-primary" onclick="event.stopPropagation(); window.advanceTaskStatus('${t.id}')">STATUS →</button>
        </div>
      </div>
    `;
  };

  todoCol.innerHTML = todos.length ? todos.map(renderCard).join('') : '<div style="color:var(--tui-text-muted); font-size:0.72rem; padding:0.5rem;">No tasks</div>';
  inProgressCol.innerHTML = inProgress.length ? inProgress.map(renderCard).join('') : '<div style="color:var(--tui-text-muted); font-size:0.72rem; padding:0.5rem;">No tasks</div>';
  completedCol.innerHTML = completed.length ? completed.map(renderCard).join('') : '<div style="color:var(--tui-text-muted); font-size:0.72rem; padding:0.5rem;">No tasks</div>';
}

function populateAssigneeFilter() {
  const sel = document.getElementById('task-filter-assignee');
  if (!sel) return;
  const curVal = sel.value;
  sel.innerHTML = `<option value="ALL">All Assignees (${state.tasks.length})</option>` +
    state.team.map(m => `<option value="${m.id}" ${curVal === m.id ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('');
}

function renderResourcesTab() {
  const grid = document.getElementById('resources-grid');
  if (!grid) return;

  if (state.resources.length === 0) {
    grid.innerHTML = `<div style="color:var(--tui-text-dim); font-size:0.8rem;">No resources listed. Click + RESOURCE to add.</div>`;
    return;
  }

  grid.innerHTML = state.resources.map(r => `
    <div class="category-card">
      <div class="category-card-header">
        <span class="diff-pill-good">${r.type || 'GUIDE'}</span>
        ${r.url ? `<a href="${r.url}" target="_blank" rel="noopener noreferrer" class="btn-term btn-term-sm" style="color:var(--tui-accent);">OPEN ↗</a>` : ''}
      </div>
      <strong style="color:var(--tui-text-highlight); font-size:0.95rem;">${escapeHtml(r.title)}</strong>
      <p style="font-size:0.78rem; color:var(--tui-text-dim); line-height:1.4;">${escapeHtml(r.description || r.content || '')}</p>
      ${r.tags && r.tags.length ? `
        <div style="display:flex; flex-wrap:wrap; gap:0.25rem; margin-top:0.35rem;">
          ${r.tags.map(tag => `<span style="background:rgba(255,255,255,0.05); padding:1px 5px; border-radius:4px; font-size:0.68rem; color:var(--tui-text-muted);">#${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
      <div style="display:flex; justify-content:flex-end; gap:0.3rem; margin-top:0.5rem;">
        <button class="btn-term btn-term-sm" onclick="window.editResource('${r.id}')">EDIT</button>
        <button class="btn-term btn-term-sm btn-term-danger" onclick="window.deleteResource('${r.id}')">DELETE</button>
      </div>
    </div>
  `).join('');
}

function renderTeamTab() {
  const grid = document.getElementById('team-grid');
  if (!grid) return;

  if (state.team.length === 0) {
    grid.innerHTML = `<div style="color:var(--tui-text-dim); font-size:0.8rem;">No squad members. Click + MEMBER to add.</div>`;
    return;
  }

  grid.innerHTML = state.team.map(m => {
    const assignedTasks = state.tasks.filter(t => t.assigneeId === m.id);
    const done = assignedTasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
    return `
      <div class="category-card">
        <div class="category-card-header">
          <span class="diff-pill-good">${escapeHtml(m.role || 'Contributor')}</span>
          <span style="font-size:0.75rem; color:var(--tui-accent); font-weight:700;">${done}/${assignedTasks.length} Tasks</span>
        </div>
        <h3 class="category-title">${escapeHtml(m.name)}</h3>
        <p style="font-size:0.78rem; color:var(--tui-text-dim);">${escapeHtml(m.email || 'N/A')}</p>
        
        <div style="margin-top:0.5rem; border-top:1px dashed var(--tui-border); padding-top:0.4rem; font-size:0.72rem; color:var(--tui-text-muted);">
          Assigned: ${assignedTasks.length ? assignedTasks.map(t => escapeHtml(t.title)).slice(0, 2).join(', ') : 'None'}
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.3rem; margin-top:0.5rem;">
          <button class="btn-term btn-term-sm" onclick="window.editTeamMember('${m.id}')">EDIT</button>
          <button class="btn-term btn-term-sm btn-term-danger" onclick="window.deleteTeamMember('${m.id}')">DELETE</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderObservabilityTab() {
  const rawInspect = document.getElementById('pgbot-raw-inspect');
  const cacheHitEl = document.getElementById('pg-cache-ratio');
  const connsEl = document.getElementById('pg-active-conns');
  const dbSizeEl = document.getElementById('pg-db-size');

  if (state.pgbot?.inspect) {
    const i = state.pgbot.inspect;
    if (cacheHitEl && i.database?.cacheHitRatio) cacheHitEl.textContent = i.database.cacheHitRatio;
    if (connsEl && i.connections?.total) connsEl.textContent = i.connections.total;
    if (dbSizeEl && i.database?.size) dbSizeEl.textContent = i.database.size;
    if (rawInspect) rawInspect.textContent = JSON.stringify(state.pgbot, null, 2);
  }
}

// Radio Browser & Audio Streaming
async function fetchRadioStations() {
  try {
    const res = await fetch('https://de1.api.radio-browser.info/json/stations/search?limit=24&order=clickcount&reverse=true');
    const data = await res.json();
    state.radio.stations = data || [];
    renderRadioGrid();
  } catch (err) {
    console.warn('Radio browser fetch failed, using curated stations:', err);
    state.radio.stations = [
      { name: 'Lofi Girl Live', url: 'https://stream.zeno.fm/f3wvbbqmdg8uv', tags: 'lofi, chill, ambient', bitrate: 128 },
      { name: 'SomaFM: Groove Salad', url: 'https://ice1.somafm.com/groovesalad-128-mp3', tags: 'ambient, downtempo', bitrate: 128 },
      { name: 'SomaFM: DEF CON Radio', url: 'https://ice2.somafm.com/defcon-128-mp3', tags: 'cyber, hacker, synth', bitrate: 128 },
      { name: 'Nightwave Plaza Synthwave', url: 'https://radio.plaza.one/mp3', tags: 'synthwave, vaporwave', bitrate: 128 },
      { name: 'ChilledCat Lofi Beats', url: 'https://stream.zeno.fm/0r0xa792kwzuv', tags: 'beats, relax, study', bitrate: 128 },
      { name: 'Monstercat Electronic', url: 'https://stream.monstercat.com/live', tags: 'edm, future bass', bitrate: 192 },
    ];
    renderRadioGrid();
  }
}

function renderRadioGrid() {
  const grid = document.getElementById('radio-stations-grid');
  if (!grid) return;

  grid.innerHTML = state.radio.stations.map((s, idx) => `
    <div class="category-card" style="cursor:pointer; border-color:${state.radio.selectedIndex === idx ? 'var(--tui-accent)' : 'var(--tui-border)'};" onclick="window.selectRadioStation(${idx})">
      <div class="category-card-header">
        <strong style="color:var(--tui-text-highlight); font-size:0.85rem;">${escapeHtml(s.name)}</strong>
        <span class="diff-pill-good">${s.bitrate || 128}k</span>
      </div>
      <p style="font-size:0.72rem; color:var(--tui-text-dim);">${escapeHtml(s.tags || 'Music')}</p>
    </div>
  `).join('');
}

function selectRadioStation(idx) {
  state.radio.selectedIndex = idx;
  renderRadioGrid();
  const station = state.radio.stations[idx];
  if (!station) return;

  const currentDisplay = document.getElementById('radio-current-station');
  if (currentDisplay) currentDisplay.textContent = `▶ ${station.name} (${station.bitrate || 128}kbps)`;

  if (!state.radio.audioEl) {
    state.radio.audioEl = new Audio();
  }

  state.radio.audioEl.src = station.url_resolved || station.url;
  state.radio.audioEl.play().then(() => {
    state.radio.isPlaying = true;
    const btn = document.getElementById('btn-radio-toggle-play');
    const status = document.getElementById('radio-live-status');
    if (btn) btn.textContent = '⏸ PAUSE STREAM';
    if (status) {
      status.textContent = 'STREAMING LIVE';
      status.style.color = '#10b981';
    }
    setupAudioVisualizer();
  }).catch((err) => {
    showToast('Click "Play Stream" to enable audio playback');
  });
}

function toggleRadioPlay() {
  if (!state.radio.audioEl) {
    selectRadioStation(state.radio.selectedIndex || 0);
    return;
  }

  const btn = document.getElementById('btn-radio-toggle-play');
  const status = document.getElementById('radio-live-status');

  if (state.radio.audioEl.paused) {
    state.radio.audioEl.play();
    state.radio.isPlaying = true;
    if (btn) btn.textContent = '⏸ PAUSE STREAM';
    if (status) status.textContent = 'STREAMING LIVE';
    setupAudioVisualizer();
  } else {
    state.radio.audioEl.pause();
    state.radio.isPlaying = false;
    if (btn) btn.textContent = '▶ PLAY STREAM';
    if (status) status.textContent = 'PAUSED';
  }
}

function setupAudioVisualizer() {
  const canvas = document.getElementById('radio-oscilloscope');
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
      const v = state.radio.isPlaying ? (Math.sin(i * 0.35 + Date.now() * 0.006) * 0.45 + 0.5) : 0.5;
      const y = v * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.stroke();
  }

  if (!state.radio.animationFrameId) draw();
}

// Tab Switching
function switchTab(tabName) {
  state.activeTab = tabName;

  document.querySelectorAll('.tui-nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  document.querySelectorAll('.tui-view').forEach(view => {
    view.classList.toggle('active', view.id === `tab-${tabName}`);
  });

  if (tabName === 'flexbox') {
    if (!flexboxLabInstance) {
      flexboxLabInstance = new FlexboxLabs('neo-flex-playground');
    }
    flexboxLabInstance.render();
  } else if (tabName === 'observability') {
    fetchPgbotStats();
  } else if (tabName === 'radio') {
    if (state.radio.stations.length === 0) fetchRadioStations();
  }
}

// Theme Handling
function setTheme(themeName) {
  if (!THEMES.includes(themeName)) return;
  state.theme = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('tui-theme', themeName);
  const display = document.getElementById('theme-name-display');
  if (display) display.textContent = themeName.toUpperCase();
}

function cycleTheme() {
  const curIdx = THEMES.indexOf(state.theme);
  const nextTheme = THEMES[(curIdx + 1) % THEMES.length];
  setTheme(nextTheme);
  showToast(`Palette switched to: ${nextTheme.toUpperCase()}`);
}

function toggleCRT() {
  state.crtEnabled = !state.crtEnabled;
  localStorage.setItem('tui-crt', state.crtEnabled);
  const overlay = document.getElementById('crt-overlay');
  const crtBtn = document.getElementById('btn-toggle-crt');
  if (overlay) overlay.classList.toggle('disabled', !state.crtEnabled);
  if (crtBtn) crtBtn.textContent = `CRT: ${state.crtEnabled ? 'ON' : 'OFF'}`;
  showToast(`CRT scanlines: ${state.crtEnabled ? 'ENABLED' : 'DISABLED'}`);
}

async function triggerSeedReset() {
  try {
    showToast('Resetting & seeding BNB Chain Smart Money Era data...');
    await api.triggerSeed();
    await fetchAllData();
    showToast('✅ Official BNB Chain Hackathon seed loaded successfully!');
  } catch (err) {
    alert('Failed to seed: ' + err.message);
  }
}

// Task Status Advance
async function advanceTaskStatus(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const transitions = {
    'TODO': 'IN_PROGRESS',
    'PENDING': 'IN_PROGRESS',
    'IN_PROGRESS': 'COMPLETED',
    'DOING': 'COMPLETED',
    'COMPLETED': 'TODO',
    'DONE': 'TODO',
  };

  const nextStatus = transitions[task.status] || 'IN_PROGRESS';
  try {
    await api.updateTask(taskId, { status: nextStatus });
    task.status = nextStatus;
    renderTasksTab();
    renderOverviewTab();
    showToast(`Task status updated to: ${nextStatus}`);
  } catch (err) {
    alert(err.message);
  }
}

// Modal Handlers
function openModal(type, itemId = null) {
  const backdrop = document.getElementById('tui-modal-backdrop');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  if (!backdrop || !body) return;

  let html = '';
  if (type === 'task') {
    const task = itemId ? state.tasks.find(t => t.id === itemId) : null;
    title.textContent = task ? '> EDIT SPRINT DELIVERABLE' : '> NEW SPRINT DELIVERABLE';
    html = `
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">DELIVERABLE TITLE</label>
      <input type="text" id="m-task-title" class="tui-input" value="${escapeHtml(task?.title || '')}" placeholder="e.g. Build Venus Lending Health Sentinel">
      
      <label style="font-size:0.75rem; color:var(--tui-text-dim); margin-top:0.5rem;">DESCRIPTION</label>
      <textarea id="m-task-desc" class="tui-textarea" rows="3" placeholder="Technical specifications...">${escapeHtml(task?.description || '')}</textarea>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-top:0.5rem;">
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
            ${state.team.map(m => `<option value="${m.id}" ${task?.assigneeId === m.id ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
        <button class="btn-term" onclick="window.closeModal()">CANCEL</button>
        <button class="btn-term btn-term-primary" id="btn-save-task">SAVE DELIVERABLE</button>
      </div>
    `;
    body.innerHTML = html;
    document.getElementById('btn-save-task').onclick = () => saveTask(itemId);
  } else if (type === 'deadline') {
    const d = itemId ? state.deadlines.find(x => x.id === itemId) : null;
    title.textContent = d ? '> EDIT MILESTONE' : '> NEW MILESTONE';
    const dueFormatted = d ? new Date(d.dueDate).toISOString().slice(0, 16) : new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16);
    html = `
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">MILESTONE TITLE</label>
      <input type="text" id="m-dl-title" class="tui-input" value="${escapeHtml(d?.title || '')}" placeholder="e.g. Code Freeze & Submission">
      
      <label style="font-size:0.75rem; color:var(--tui-text-dim); margin-top:0.5rem;">DESCRIPTION</label>
      <textarea id="m-dl-desc" class="tui-textarea" rows="2">${escapeHtml(d?.description || '')}</textarea>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-top:0.5rem;">
        <div>
          <label style="font-size:0.75rem; color:var(--tui-text-dim);">DUE DATE (UTC)</label>
          <input type="datetime-local" id="m-dl-date" class="tui-input" value="${dueFormatted}">
        </div>
        <div>
          <label style="font-size:0.75rem; color:var(--tui-text-dim);">PRIORITY</label>
          <select id="m-dl-priority" class="tui-select">
            <option value="CRITICAL" ${d?.priority === 'CRITICAL' ? 'selected' : ''}>CRITICAL</option>
            <option value="HIGH" ${d?.priority === 'HIGH' ? 'selected' : ''}>HIGH</option>
            <option value="MEDIUM" ${!d || d?.priority === 'MEDIUM' ? 'selected' : ''}>MEDIUM</option>
          </select>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
        <button class="btn-term" onclick="window.closeModal()">CANCEL</button>
        <button class="btn-term btn-term-primary" id="btn-save-dl">SAVE MILESTONE</button>
      </div>
    `;
    body.innerHTML = html;
    document.getElementById('btn-save-dl').onclick = () => saveDeadline(itemId);
  } else if (type === 'resource') {
    const r = itemId ? state.resources.find(x => x.id === itemId) : null;
    title.textContent = r ? '> EDIT RESOURCE' : '> NEW RESOURCE';
    html = `
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">TITLE</label>
      <input type="text" id="m-res-title" class="tui-input" value="${escapeHtml(r?.title || '')}" placeholder="e.g. 8004scan API Portal">
      
      <label style="font-size:0.75rem; color:var(--tui-text-dim); margin-top:0.5rem;">URL</label>
      <input type="url" id="m-res-url" class="tui-input" value="${escapeHtml(r?.url || '')}" placeholder="https://...">
      
      <label style="font-size:0.75rem; color:var(--tui-text-dim); margin-top:0.5rem;">DESCRIPTION</label>
      <textarea id="m-res-desc" class="tui-textarea" rows="2">${escapeHtml(r?.description || '')}</textarea>

      <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
        <button class="btn-term" onclick="window.closeModal()">CANCEL</button>
        <button class="btn-term btn-term-primary" id="btn-save-res">SAVE RESOURCE</button>
      </div>
    `;
    body.innerHTML = html;
    document.getElementById('btn-save-res').onclick = () => saveResource(itemId);
  } else if (type === 'member') {
    const m = itemId ? state.team.find(x => x.id === itemId) : null;
    title.textContent = m ? '> EDIT SQUAD MEMBER' : '> ADD SQUAD MEMBER';
    html = `
      <label style="font-size:0.75rem; color:var(--tui-text-dim);">NAME</label>
      <input type="text" id="m-member-name" class="tui-input" value="${escapeHtml(m?.name || '')}" placeholder="Alex Rivera">

      <label style="font-size:0.75rem; color:var(--tui-text-dim); margin-top:0.5rem;">EMAIL</label>
      <input type="email" id="m-member-email" class="tui-input" value="${escapeHtml(m?.email || '')}" placeholder="alex@bnbchain.org">

      <label style="font-size:0.75rem; color:var(--tui-text-dim); margin-top:0.5rem;">ROLE</label>
      <input type="text" id="m-member-role" class="tui-input" value="${escapeHtml(m?.role || '')}" placeholder="Smart Contract Engineer">

      <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
        <button class="btn-term" onclick="window.closeModal()">CANCEL</button>
        <button class="btn-term btn-term-primary" id="btn-save-member">SAVE MEMBER</button>
      </div>
    `;
    body.innerHTML = html;
    document.getElementById('btn-save-member').onclick = () => saveTeamMember(itemId);
  }

  backdrop.classList.add('open');
}

function closeModal() {
  const backdrop = document.getElementById('tui-modal-backdrop');
  if (backdrop) backdrop.classList.remove('open');
}

async function saveTask(id) {
  const title = document.getElementById('m-task-title')?.value.trim();
  const description = document.getElementById('m-task-desc')?.value.trim();
  const priority = document.getElementById('m-task-priority')?.value;
  const assigneeId = document.getElementById('m-task-assignee')?.value || null;

  if (!title) return alert('Title is required');

  try {
    if (id) await api.updateTask(id, { title, description, priority, assigneeId });
    else await api.createTask({ title, description, priority, assigneeId });
    closeModal();
    showToast('Deliverable task saved!');
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

  if (!title || !dueDate) return alert('Title and Date are required');

  try {
    if (id) await api.updateDeadline(id, { title, description, priority, dueDate: new Date(dueDate).toISOString() });
    else await api.createDeadline({ title, description, priority, dueDate: new Date(dueDate).toISOString() });
    closeModal();
    showToast('Milestone saved!');
    await fetchAllData();
  } catch (err) {
    alert(err.message);
  }
}

async function saveResource(id) {
  const title = document.getElementById('m-res-title')?.value.trim();
  const url = document.getElementById('m-res-url')?.value.trim() || null;
  const description = document.getElementById('m-res-desc')?.value.trim();

  if (!title) return alert('Title is required');

  try {
    if (id) await api.updateResource(id, { title, url, description, type: 'LINK', tags: ['bnb', 'guide'] });
    else await api.createResource({ title, url, description, type: 'LINK', tags: ['bnb', 'guide'], createdBy: 'Squad' });
    closeModal();
    showToast('Resource saved!');
    await fetchAllData();
  } catch (err) {
    alert(err.message);
  }
}

async function saveTeamMember(id) {
  const name = document.getElementById('m-member-name')?.value.trim();
  const email = document.getElementById('m-member-email')?.value.trim();
  const role = document.getElementById('m-member-role')?.value.trim();

  if (!name || !email) return alert('Name and email are required');

  try {
    if (id) await api.updateTeam(id, { name, email, role });
    else await api.createTeam({ name, email, role });
    closeModal();
    showToast('Squad member saved!');
    await fetchAllData();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteDeadline(id) {
  if (!confirm('Delete this milestone?')) return;
  try {
    await api.deleteDeadline(id);
    showToast('Milestone removed');
    await fetchAllData();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteResource(id) {
  if (!confirm('Delete this resource?')) return;
  try {
    await api.deleteResource(id);
    showToast('Resource removed');
    await fetchAllData();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteTeamMember(id) {
  if (!confirm('Remove squad member?')) return;
  try {
    await api.deleteTeam(id);
    showToast('Squad member removed');
    await fetchAllData();
  } catch (err) {
    alert(err.message);
  }
}

// Global Window Bindings
window.switchTab = switchTab;
window.editTask = (id) => openModal('task', id);
window.editDeadline = (id) => openModal('deadline', id);
window.editResource = (id) => openModal('resource', id);
window.editTeamMember = (id) => openModal('member', id);
window.deleteDeadline = deleteDeadline;
window.deleteResource = deleteResource;
window.deleteTeamMember = deleteTeamMember;
window.advanceTaskStatus = advanceTaskStatus;
window.closeModal = closeModal;
window.selectRadioStation = selectRadioStation;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  setTheme(state.theme);
  const overlay = document.getElementById('crt-overlay');
  const crtBtn = document.getElementById('btn-toggle-crt');
  if (overlay) overlay.classList.toggle('disabled', !state.crtEnabled);
  if (crtBtn) crtBtn.textContent = `CRT: ${state.crtEnabled ? 'ON' : 'OFF'}`;

  // Initial Animate-Text kinetic reveal on hero title
  const heroTitle = document.getElementById('hero-main-title');
  if (heroTitle) {
    AnimateText.softBlurIn(heroTitle);
  }

  // Motion engine selector chips
  document.querySelectorAll('.motion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.motion-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const motionId = chip.dataset.motion;
      if (heroTitle) {
        AnimateText.apply(heroTitle, motionId);
      }
    });
  });

  // Top Nav Tab Switching
  document.querySelectorAll('.tui-nav-link').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Buttons
  const seedBtn = document.getElementById('btn-seed-db');
  if (seedBtn) seedBtn.addEventListener('click', triggerSeedReset);

  const cycleThemeBtn = document.getElementById('btn-cycle-theme');
  if (cycleThemeBtn) cycleThemeBtn.addEventListener('click', cycleTheme);

  const toggleCrtBtn = document.getElementById('btn-toggle-crt');
  if (toggleCrtBtn) toggleCrtBtn.addEventListener('click', toggleCRT);

  const newTaskBtn = document.getElementById('btn-new-task');
  if (newTaskBtn) newTaskBtn.addEventListener('click', () => openModal('task'));

  const addTaskInlineBtn = document.getElementById('btn-add-task-inline');
  if (addTaskInlineBtn) addTaskInlineBtn.addEventListener('click', () => openModal('task'));

  const createDlBtn = document.getElementById('btn-create-deadline');
  if (createDlBtn) createDlBtn.addEventListener('click', () => openModal('deadline'));

  const createResBtn = document.getElementById('btn-create-resource');
  if (createResBtn) createResBtn.addEventListener('click', () => openModal('resource'));

  const createMemberBtn = document.getElementById('btn-create-member');
  if (createMemberBtn) createMemberBtn.addEventListener('click', () => openModal('member'));

  const refreshPgbotBtn = document.getElementById('btn-refresh-pgbot');
  if (refreshPgbotBtn) refreshPgbotBtn.addEventListener('click', fetchPgbotStats);

  const modalCloseBtn = document.getElementById('modal-close-btn');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

  const copyInstallBtn = document.getElementById('btn-copy-install');
  if (copyInstallBtn) {
    copyInstallBtn.addEventListener('click', () => {
      const snippet = document.getElementById('install-snippet')?.textContent || 'npx bnb-agent-studio init --track smart-money-era';
      navigator.clipboard.writeText(snippet);
      showToast('Install command copied to clipboard!');
    });
  }

  const radioPlayBtn = document.getElementById('btn-radio-toggle-play');
  if (radioPlayBtn) radioPlayBtn.addEventListener('click', toggleRadioPlay);

  // Assignee filter
  const filterSel = document.getElementById('task-filter-assignee');
  if (filterSel) {
    filterSel.addEventListener('change', (e) => {
      state.filters.taskAssignee = e.target.value;
      renderTasksTab();
    });
  }

  // CLI Command prompt
  const cliInput = document.getElementById('cli-command-input');
  if (cliInput) {
    cliInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = cliInput.value.trim().toLowerCase();
        cliInput.value = '';
        if (cmd === '1' || cmd === 'overview') switchTab('overview');
        else if (cmd === '2' || cmd === 'tracks') switchTab('tracks');
        else if (cmd === '3' || cmd === 'deadlines') switchTab('deadlines');
        else if (cmd === '4' || cmd === 'tasks') switchTab('tasks');
        else if (cmd === '5' || cmd === 'flexbox' || cmd === 'flex') switchTab('flexbox');
        else if (cmd === '6' || cmd === 'resources') switchTab('resources');
        else if (cmd === '7' || cmd === 'team') switchTab('team');
        else if (cmd === '8' || cmd === 'pgbot' || cmd === 'observability') switchTab('observability');
        else if (cmd === '9' || cmd === 'radio') switchTab('radio');
        else if (cmd === 'crt') toggleCRT();
        else if (cmd.startsWith('theme ')) setTheme(cmd.split(' ')[1]);
        else if (cmd === 'seed') triggerSeedReset();
        else if (cmd === 'task') openModal('task');
        else if (cmd === 'deadline') openModal('deadline');
        else if (cmd === '?') showToast('Commands: 1-9, tracks, tasks, flexbox, deadlines, theme, crt, seed');
        else showToast(`Unknown command: ${cmd}`);
      }
    });
  }

  // Keyboard Shortcuts (1-9, T, ESC)
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable) {
      if (e.key === 'Escape') closeModal();
      return;
    }
    if (e.key >= '1' && e.key <= '9') {
      const tabs = ['overview', 'tracks', 'deadlines', 'tasks', 'flexbox', 'resources', 'team', 'observability', 'radio'];
      switchTab(tabs[parseInt(e.key) - 1]);
    } else if (e.key.toLowerCase() === 't') {
      cycleTheme();
    } else if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Fetch initial data
  fetchAllData();

  // Ticker interval
  setInterval(() => {
    renderOverviewTab();
    renderDeadlinesTab();
  }, 1000);
});

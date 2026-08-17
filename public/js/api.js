// Hackathon Manager - Robust API Client with Live Cloud Fallback

const LOCAL_API_BASE = '/api';
const CLOUD_API_BASE = 'https://api-production-83367.up.railway.app/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // 1. Try local API base first
  try {
    const localUrl = `${LOCAL_API_BASE}${endpoint}`;
    const response = await fetch(localUrl, config);
    if (response.status === 204) return null;
    if (response.ok) {
      return await response.json();
    }
  } catch (localErr) {
    // If running on local dev server where local backend/DB is not running, fallback to cloud
    console.warn(`Local API [${endpoint}] unavailable, trying live cloud instance...`);
  }

  // 2. Fallback to live Railway production API
  try {
    const cloudUrl = `${CLOUD_API_BASE}${endpoint}`;
    const cloudResponse = await fetch(cloudUrl, config);
    if (cloudResponse.status === 204) return null;
    const data = await cloudResponse.json().catch(() => null);
    if (!cloudResponse.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${cloudResponse.status}`);
    }
    return data;
  } catch (cloudErr) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, cloudErr);
    throw cloudErr;
  }
}

export const api = {
  // Progress
  getProgressSummary: () => request('/progress/summary'),
  getMemberProgress: (memberId) => request(`/progress/team/${memberId}`),

  // Deadlines
  getDeadlines: () => request('/deadlines'),
  getUpcomingDeadlines: () => request('/deadlines/upcoming'),
  createDeadline: (data) => request('/deadlines', { method: 'POST', body: JSON.stringify(data) }),
  updateDeadline: (id, data) => request(`/deadlines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDeadline: (id) => request(`/deadlines/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => request('/tasks'),
  getTasksByMember: (memberId) => request(`/tasks/team/${memberId}`),
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Resources
  getResources: () => request('/resources'),
  createResource: (data) => request('/resources', { method: 'POST', body: JSON.stringify(data) }),
  updateResource: (id, data) => request(`/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteResource: (id) => request(`/resources/${id}`, { method: 'DELETE' }),

  // Team
  getTeam: () => request('/team'),
  createTeam: (data) => request('/team', { method: 'POST', body: JSON.stringify(data) }),
  updateTeam: (id, data) => request(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeam: (id) => request(`/team/${id}`, { method: 'DELETE' }),

  // pgbot / Observability
  getPgbotInspect: () => request('/pgbot/inspect'),
  getPgbotIndexes: () => request('/pgbot/indexes'),
  getPgbotQueries: () => request('/pgbot/queries'),
  getPgbotVacuum: () => request('/pgbot/vacuum'),
  triggerSeed: () => request('/pgbot/seed', { method: 'POST' }),
};

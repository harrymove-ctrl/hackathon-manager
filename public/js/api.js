// Hackathon Manager - API Client

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP error ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
    throw err;
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
  createTeamMember: (data) => request('/team', { method: 'POST', body: JSON.stringify(data) }),
  updateTeamMember: (id, data) => request(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeamMember: (id) => request(`/team/${id}`, { method: 'DELETE' }),

  // pgbot / Observability
  getPgbotInspect: () => request('/pgbot/inspect'),
  getPgbotIndexes: () => request('/pgbot/indexes'),
  getPgbotQueries: () => request('/pgbot/queries'),
  getPgbotVacuum: () => request('/pgbot/vacuum'),
  triggerSeed: () => request('/pgbot/seed', { method: 'POST' }),
};

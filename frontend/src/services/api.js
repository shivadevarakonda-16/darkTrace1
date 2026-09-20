// In a single-service deployment (backend serves the built frontend), a
// relative '/api' is correct — same origin, no config needed.
// In a split deployment (frontend and backend on different hosts, e.g.
// Vercel + Render), set VITE_API_BASE at build time to the backend's full
// URL, e.g. VITE_API_BASE=https://aegistrace-api.onrender.com/api
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getToken() {
  return localStorage.getItem('aegis-token') || '';
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleAuthError(res) {
  if (res.status === 401) {
    // Session expired or invalid — clear it and force back to login.
    localStorage.removeItem('aegis-token');
    localStorage.removeItem('aegis-user');
    window.dispatchEvent(new Event('aegis-session-expired'));
  }
}

export const api = {
  // --- Auth ---
  async loginAdmin(username, password) {
    const res = await fetch(`${API_BASE}/auth/login/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Admin login failed');
    return data;
  },

  async loginInvestigator(username, password) {
    const res = await fetch(`${API_BASE}/auth/login/investigator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Investigator login failed');
    return data;
  },

  async whoAmI() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
    if (!res.ok) {
      await handleAuthError(res);
      throw new Error('Session invalid');
    }
    return res.json();
  },

  // Actors
  async getActors(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/actors?${query}`, { headers: authHeaders() });
    if (!res.ok) { await handleAuthError(res); throw new Error('Failed to fetch threat actors'); }
    return res.json();
  },

  async getActorById(id) {
    const res = await fetch(`${API_BASE}/actors/${id}`, { headers: authHeaders() });
    if (!res.ok) { await handleAuthError(res); throw new Error(`Failed to fetch actor ${id}`); }
    return res.json();
  },

  async getActorTimeline(id) {
    const res = await fetch(`${API_BASE}/actors/${id}/timeline`, { headers: authHeaders() });
    if (!res.ok) { await handleAuthError(res); throw new Error(`Failed to fetch timeline for actor ${id}`); }
    return res.json();
  },

  // Attribution
  async computePairAttribution(actorAId, actorBId, weights = null, prior = null) {
    const res = await fetch(`${API_BASE}/attribution/pair`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ actorAId, actorBId, weights, prior })
    });
    if (!res.ok) { await handleAuthError(res); throw new Error('Failed to compute attribution'); }
    return res.json();
  },

  async getAttributionMatrix(minConfidence = 0) {
    const res = await fetch(`${API_BASE}/attribution/matrix?minConfidence=${minConfidence}`, { headers: authHeaders() });
    if (!res.ok) { await handleAuthError(res); throw new Error('Failed to fetch attribution matrix'); }
    return res.json();
  },

  async getGlobalStats() {
    const res = await fetch(`${API_BASE}/attribution/stats`, { headers: authHeaders() });
    if (!res.ok) { await handleAuthError(res); throw new Error('Failed to fetch telemetry stats'); }
    return res.json();
  },

  // Graph
  async getGraphData(minConfidence = 30, includeIdentifiers = true, theme = 'light') {
    const res = await fetch(`${API_BASE}/graph?minConfidence=${minConfidence}&includeIdentifiers=${includeIdentifiers}&theme=${theme}`, { headers: authHeaders() });
    if (!res.ok) { await handleAuthError(res); throw new Error('Failed to fetch graph data'); }
    return res.json();
  },

  // Scans & System
  async simulateScan(payload) {
    const res = await fetch(`${API_BASE}/scan/simulate`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) { await handleAuthError(res); throw new Error('Scan simulation failed'); }
    return res.json();
  },

  async resetData() {
    const res = await fetch(`${API_BASE}/scan/reset`, { method: 'POST', headers: authHeaders() });
    if (!res.ok) { await handleAuthError(res); throw new Error('Failed to reset dataset'); }
    return res.json();
  },

  // Reports & Exports
  async getDossierReport(id) {
    const res = await fetch(`${API_BASE}/export/report/${id}`, { headers: authHeaders() });
    if (!res.ok) { await handleAuthError(res); throw new Error('Failed to generate dossier'); }
    return res.json();
  },

  // Auth-protected file downloads: fetch as blob, then trigger a save-as.
  async downloadFile(path, filename) {
    const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
    if (!res.ok) { await handleAuthError(res); throw new Error('Download failed'); }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // --- Admin: dataset management ---
  async uploadActorsCsv(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/admin/actors/upload-csv`, {
      method: 'POST',
      headers: authHeaders(), // don't set Content-Type — browser sets multipart boundary
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) { await handleAuthError(res); throw new Error(data.error || 'CSV upload failed'); }
    return data;
  },

  async getAdminStatus() {
    const res = await fetch(`${API_BASE}/admin/status`, { headers: authHeaders() });
    if (!res.ok) { await handleAuthError(res); throw new Error('Failed to fetch admin status'); }
    return res.json();
  },
};

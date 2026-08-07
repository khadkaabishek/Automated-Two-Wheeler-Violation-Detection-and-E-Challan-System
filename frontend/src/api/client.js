const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

const TOKEN_KEY = 'echallan_access_token';
const REFRESH_KEY = 'echallan_refresh_token';

export const tokenStore = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

let refreshPromise = null;

async function doRefresh() {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new ApiError('No refresh token available', 401);

  const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    tokenStore.clear();
    throw new ApiError(json.message || 'Session expired', res.status);
  }
  tokenStore.set(json.data.accessToken, json.data.refreshToken);
  return json.data.accessToken;
}

/**
 * Core request function. Handles JSON bodies, auth headers, the standard
 * { success, message, data, errors } envelope, and a single silent
 * refresh-and-retry on 401.
 */
async function request(path, { method = 'GET', body, isForm = false, query, retry = true } = {}) {
  let url = `${BASE_URL}${path}`;
  if (query) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const headers = {};
  const token = tokenStore.getAccess();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method,
    headers,
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  // File downloads (excel/pdf) bypass JSON parsing
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!res.ok) throw new ApiError('Request failed', res.status);
    return res.blob();
  }

  const json = await res.json().catch(() => ({}));

  if (res.status === 401 && retry && token) {
    if (!refreshPromise) refreshPromise = doRefresh().finally(() => (refreshPromise = null));
    try {
      await refreshPromise;
      return request(path, { method, body, isForm, query, retry: false });
    } catch {
      tokenStore.clear();
      window.location.href = '/login';
      throw new ApiError('Session expired. Please log in again.', 401);
    }
  }

  if (!res.ok || json.success === false) {
    throw new ApiError(json.message || 'Something went wrong', res.status, json.errors);
  }

  return json.data;
}

export const api = {
  get: (path, query) => request(path, { method: 'GET', query }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
  postForm: (path, formData) => request(path, { method: 'POST', body: formData, isForm: true }),
  download: (path, query) => request(path, { method: 'GET', query }),
};

export { BASE_URL };

// Uploaded files (evidence photos, plate previews, avatars, etc.) are served
// statically from the API origin, not under /api/v1 — this strips that
// suffix so callers can build `${FILE_ORIGIN}${relativePath}` image URLs.
export const FILE_ORIGIN = BASE_URL.replace(/\/api\/v\d+\/?$/, '');

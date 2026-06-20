import axios from 'axios';

// Dynamically resolve base URL to support loopback and local LAN hostname connections
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  return `${protocol}//${hostname}:5000/api`;
};

// Public endpoints that should NOT get an Authorization header attached
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/b2b/login',
  '/b2b/register',
  '/leads/capture',
  '/health',
];

// Create a single shared Axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  }
});

// ─── Response normalization ───────────────────────────────────────────────
// The backend was migrated from Node/Mongo to Spring Boot, which changed
// response shapes: Mongo's `_id` became `id`, and list endpoints now return a
// Spring `Page` object ({ content, totalElements, ... }) instead of a bare array.
// The existing frontend was written against the old contract, so we normalize
// every response here in one place rather than touching dozens of call sites:
//   • recursively expose `_id` as an alias of `id`
//   • unwrap Spring `Page` objects to their `content` array
function normalizeData(data) {
  if (Array.isArray(data)) return data.map(normalizeData);
  if (data && typeof data === 'object') {
    // Spring Page → unwrap to the content array
    if (Array.isArray(data.content) &&
        ('totalElements' in data || 'pageable' in data || 'number' in data)) {
      return normalizeData(data.content);
    }
    const out = {};
    for (const key of Object.keys(data)) out[key] = normalizeData(data[key]);
    if (out._id == null && out.id != null) out._id = out.id;
    return out;
  }
  return data;
}

api.interceptors.response.use(
  (response) => {
    if (response && response.data != null) response.data = normalizeData(response.data);
    return response;
  },
  (error) => Promise.reject(error)
);

// Configure JWT authorization interceptor dynamically
api.interceptors.request.use((config) => {
  // Do NOT attach token for public endpoints — prevents stale token 401 errors
  const url = config.url || '';
  const isPublic = PUBLIC_ENDPOINTS.some(ep => url.endsWith(ep));
  if (isPublic) {
    return config;
  }

  // sessionStorage is tab-isolated; fall back to localStorage for new tabs
  const token = sessionStorage.getItem('finbridge_token') || localStorage.getItem('finbridge_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
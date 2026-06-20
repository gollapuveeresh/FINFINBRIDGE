import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const h = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  const p = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  return `${p}//${h}:5000/api`;
};

// Public B2B endpoints that should NOT get an Authorization header
const B2B_PUBLIC_ENDPOINTS = [
  '/b2b/login',
  '/b2b/register',
];

const b2bApi = axios.create({ baseURL: getBaseURL(), headers: { 'Content-Type': 'application/json' } });

b2bApi.interceptors.request.use((config) => {
  // Do NOT attach token for public endpoints — prevents stale token 401 errors
  const url = config.url || '';
  const isPublic = B2B_PUBLIC_ENDPOINTS.some(ep => url.includes(ep));
  if (isPublic) return config;

  const token = sessionStorage.getItem('b2b_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default b2bApi;

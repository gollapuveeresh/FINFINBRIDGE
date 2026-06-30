import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const h = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  const p = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  if (h === 'localhost' || h === '127.0.0.1') {
    return `${p}//${h}:5000/api`;
  }
  return 'https://finbridge-backend-v2.onrender.com/api';
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

// A stale/invalid token (e.g. after a server secret rotation) yields 401/403. Instead of leaving
// the user on a broken page, clear the session and send them to login so it self-heals.
b2bApi.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const reqUrl = err.config?.url || '';
    const onLoginPage = typeof window !== 'undefined' && window.location.pathname.endsWith('/b2b/login');
    const isPublic = B2B_PUBLIC_ENDPOINTS.some(ep => reqUrl.includes(ep));
    if ((status === 401 || status === 403) && !isPublic && !onLoginPage) {
      sessionStorage.removeItem('b2b_token');
      sessionStorage.removeItem('b2b_company');
      window.location.href = '/b2b/login';
    }
    return Promise.reject(err);
  }
);

export default b2bApi;

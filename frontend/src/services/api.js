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

// Create a single shared Axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  }
});

// Configure JWT authorization interceptor dynamically
api.interceptors.request.use((config) => {
  // sessionStorage is tab-isolated; fall back to localStorage for new tabs
  const token = sessionStorage.getItem('finbridge_token') || localStorage.getItem('finbridge_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

import axios from 'axios';

// Base URL comes from Vite environment variable.
// Falls back to localhost:4000 for local development when .env.local is missing.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: read token from localStorage and attach to every request.
// This runs before every outgoing request, so the token is always current.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: normalize error shape.
// We do NOT redirect on 401 here — AuthContext and ProtectedRoute control navigation.
// Forcing a redirect inside the API client causes redirect loops on the initial
// /api/auth/me check (which legitimately 401s when no token exists).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Pass the error through unchanged. Callers decide what to do.
    return Promise.reject(error);
  }
);

export default apiClient;

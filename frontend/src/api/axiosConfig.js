import axios from 'axios';

// Base configuration for all API calls.
// Every axios call in your app uses this instance —
// not the default axios. This gives you one place
// to control headers, base URL, and interceptors.
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR
// Runs before EVERY request is sent.
// Reads JWT token from localStorage and attaches it
// to the Authorization header automatically.
// You never manually add "Bearer token" in any component.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
// Runs after EVERY response comes back.
// If backend returns 401 (token expired or invalid),
// automatically log the user out and redirect to login.
// Without this, users would see confusing API errors
// instead of being sent to login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
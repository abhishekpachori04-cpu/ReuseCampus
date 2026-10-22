import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to attach JWT token to outgoing requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('reusecampus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle expired sessions and 401 Unauthorized errors cleanly
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Ignore 401s on login/register endpoints where 401 is an expected credential rejection
    const isAuthLoginOrRegister =
      url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isAuthLoginOrRegister) {
      // Clear client session tokens
      localStorage.removeItem('reusecampus_token');
      localStorage.removeItem('reusecampus_user');

      // Dispatch global auth expiration event for React context synchronization
      window.dispatchEvent(new Event('reusecampus-auth-expired'));
    }

    return Promise.reject(error);
  }
);

export default API;

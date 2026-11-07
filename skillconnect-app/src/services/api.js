import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const getStorage = () => {
  if (localStorage.getItem('skillconnect_access_token') || localStorage.getItem('skillconnect_refresh_token')) {
    return localStorage;
  }
  return sessionStorage;
};

const getToken = (key) => localStorage.getItem(key) || sessionStorage.getItem(key);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = getToken('skillconnect_access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response || error.response.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshToken = getToken('skillconnect_refresh_token');
    if (!refreshToken) return Promise.reject(error);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh: refreshToken });
      const storage = getStorage();
      storage.setItem('skillconnect_access_token', response.data.access);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
      return api(originalRequest);
    } catch (refreshError) {
      ['skillconnect_access_token', 'skillconnect_refresh_token', 'skillconnect_user'].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      if (window.location.pathname !== '/login') window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

export default api;

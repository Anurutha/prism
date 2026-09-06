import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 90_000, // image generation can take a while
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('prism_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('prism_token');
      localStorage.removeItem('prism_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(err) {
  return err?.response?.data?.message || 'Something went wrong. Please try again.';
}

export default api;

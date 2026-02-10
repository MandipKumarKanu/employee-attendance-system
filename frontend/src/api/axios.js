import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eas_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept 401s from auth endpoints (login, refresh)
    const isAuthRoute = originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('eas_refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post('http://localhost:5000/api/auth/refresh', {
            refreshToken,
          });

          localStorage.setItem('eas_token', data.data.accessToken);
          localStorage.setItem('eas_refresh_token', data.data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('eas_token');
          localStorage.removeItem('eas_refresh_token');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('eas_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

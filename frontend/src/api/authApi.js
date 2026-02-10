import api from './axios';

export const loginApi = (credentials) => api.post('/auth/login', credentials);
export const getMeApi = () => api.get('/auth/me');
export const logoutApi = () => api.post('/auth/logout');
export const refreshTokenApi = (refreshToken) => api.post('/auth/refresh', { refreshToken });
export const changePasswordApi = (data) => api.put('/auth/change-password', data);

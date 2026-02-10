import api from './axios';

export const generateQRApi = (data) => api.post('/qr/generate', data);
export const validateQRSessionApi = (token) => api.get(`/qr/session/${token}`);
export const getActiveSessionsApi = () => api.get('/qr/active');
export const revokeSessionApi = (token) => api.delete(`/qr/session/${token}`);

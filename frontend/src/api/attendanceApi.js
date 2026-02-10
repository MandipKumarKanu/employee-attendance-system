import api from './axios';

export const checkInApi = (data) => api.post('/attendance/check-in', data);
export const checkOutApi = (data) => api.post('/attendance/check-out', data);
export const qrCheckInApi = (data) => api.post('/attendance/qr-check-in', data);
export const qrCheckOutApi = (data) => api.post('/attendance/qr-check-out', data);
export const getTodayApi = () => api.get('/attendance/today');
export const getMyHistoryApi = (params) => api.get('/attendance/my-history', { params });
export const getTeamAttendanceApi = (params) => api.get('/attendance/team', { params });
export const getAllAttendanceApi = (params) => api.get('/attendance/all', { params });
export const getUserAttendanceApi = (userId, params) => api.get(`/attendance/user/${userId}`, { params });
export const reviewAttendanceApi = (id, data) => api.put(`/attendance/${id}/review`, data);
export const updateAttendanceApi = (id, data) => api.put(`/attendance/${id}`, data);

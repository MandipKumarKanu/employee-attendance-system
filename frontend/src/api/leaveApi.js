import api from './axios';

export const applyLeaveApi = (data) => api.post('/leaves', data);
export const getMyLeavesApi = (params) => api.get('/leaves/my', { params });
export const getLeaveApi = (id) => api.get(`/leaves/${id}`);
export const cancelLeaveApi = (id) => api.put(`/leaves/${id}/cancel`);
export const getPendingLeavesApi = (params) => api.get('/leaves/pending', { params });
export const approveLeaveApi = (id) => api.put(`/leaves/${id}/approve`);
export const rejectLeaveApi = (id, data) => api.put(`/leaves/${id}/reject`, data);
export const getTeamLeavesApi = (params) => api.get('/leaves/team', { params });

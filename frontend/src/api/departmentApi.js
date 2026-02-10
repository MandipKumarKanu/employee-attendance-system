import api from './axios';

export const getDepartmentsApi = () => api.get('/departments');
export const getDepartmentApi = (id) => api.get(`/departments/${id}`);
export const createDepartmentApi = (data) => api.post('/departments', data);
export const updateDepartmentApi = (id, data) => api.put(`/departments/${id}`, data);
export const deleteDepartmentApi = (id) => api.delete(`/departments/${id}`);
export const assignManagerApi = (id, data) => api.put(`/departments/${id}/assign-manager`, data);
export const assignEmployeesApi = (id, data) => api.put(`/departments/${id}/assign-employees`, data);

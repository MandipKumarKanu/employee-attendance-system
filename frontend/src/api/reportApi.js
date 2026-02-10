import api from './axios';

export const getAttendanceSummaryApi = (params) => api.get('/reports/attendance-summary', { params });
export const getDepartmentBreakdownApi = (params) => api.get('/reports/department-breakdown', { params });
export const getLeaveAnalyticsApi = (params) => api.get('/reports/leave-analytics', { params });
export const getEmployeeReportApi = (userId, params) => api.get(`/reports/employee-report/${userId}`, { params });
export const getMonthlyOverviewApi = (params) => api.get('/reports/monthly-overview', { params });
export const exportCSVApi = (params) => api.get('/reports/export/csv', { params, responseType: 'blob' });
export const exportPDFApi = (params) => api.get('/reports/export/pdf', { params, responseType: 'blob' });

// src/api/admin.js
import apiClient from './client';

export const adminAPI = {
    getDashboardStats: () => apiClient.get('/admin/dashboard'),
    getUsers: (params) => apiClient.get('/admin/users', { params }),
    createUser: (data) => apiClient.post('/admin/users', data),
    assignRole: (userId, data) => apiClient.put(`/admin/users/${userId}/role`, data),
    deactivateUser: (userId) => apiClient.post(`/admin/users/${userId}/deactivate`),
    activateUser: (userId) => apiClient.post(`/admin/users/${userId}/activate`),
    getPaymentHistory: (params) => apiClient.get('/admin/payments', { params }),
    getActivityLogs: (params) => apiClient.get('/admin/activity-logs', { params }),
    manageRolePermissions: (roleId, data) =>
        apiClient.put(`/admin/roles/${roleId}/permissions`, data),
    exportPDF: (type) => apiClient.get('/admin/export/pdf', { params: { type } }),
    exportExcel: (type) => apiClient.get('/admin/export/excel', { params: { type } }),
};

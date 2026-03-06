// src/api/payment.js
import apiClient from './client';

export const paymentAPI = {
    getPricingPlans: () => apiClient.get('/payments/plans'),
    initiatePremiumPayment: (data) => apiClient.post('/payments/initiate-premium', data),
    completePayment: (paymentId, data) => 
        apiClient.post(`/payments/complete/${paymentId}`, data),
    getUserPayments: (params) => apiClient.get('/payments/history', { params }),
    cancelPayment: (paymentId) => apiClient.post(`/payments/cancel/${paymentId}`),
};

import { api } from './client';

export const paymentApi = {
  list: (query) => api.get('/payments', query),
  get: (id) => api.get(`/payments/${id}`),
  create: (payload) => api.post('/payments', payload),
  approve: (id) => api.patch(`/payments/${id}/approve`),
  reject: (id, reason) => api.patch(`/payments/${id}/reject`, { reason }),
  confirm: (transactionId, status) => api.post('/payments/confirm', { transactionId, status }),
};

import { api } from './client';

export const paymentApi = {
  list: (query) => api.get('/payments', query),
  get: (id) => api.get(`/payments/${id}`),
  create: (payload) => api.post('/payments', payload),
  approve: (id) => api.patch(`/payments/${id}/approve`),
  reject: (id, reason) => api.patch(`/payments/${id}/reject`, { reason }),
  confirm: (transactionId, status) => api.post('/payments/confirm', { transactionId, status }),
  uploadReceipt: (id, file) => {
    const form = new FormData();
    form.append('paymentReceipt', file);
    return api.postForm(`/payments/${id}/receipt`, form);
  },
};


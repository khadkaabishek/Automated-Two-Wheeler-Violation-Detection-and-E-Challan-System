import { api } from './client';

export const officerApplicationApi = {
  list: (query) => api.get('/officer-applications', query),
  get: (id) => api.get(`/officer-applications/${id}`),
  create: (payload) => api.post('/officer-applications', payload),
  approve: (id) => api.patch(`/officer-applications/${id}/approve`),
  reject: (id, reason) => api.patch(`/officer-applications/${id}/reject`, { reason }),
};

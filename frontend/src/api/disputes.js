import { api } from './client';

export const disputeApi = {
  list: (query) => api.get('/disputes', query),
  get: (id) => api.get(`/disputes/${id}`),
  create: (payload) => api.post('/disputes', payload),
  uphold: (id, resolutionNote) => api.patch(`/disputes/${id}/uphold`, { resolutionNote }),
  dismiss: (id, resolutionNote) => api.patch(`/disputes/${id}/dismiss`, { resolutionNote }),
};

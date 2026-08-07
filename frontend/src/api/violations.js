import { api } from './client';

export const violationApi = {
  list: (query) => api.get('/violations', query),
  get: (id) => api.get(`/violations/${id}`),
  create: (payload) => api.post('/violations', payload),
  update: (id, payload) => api.patch(`/violations/${id}`, payload),
  remove: (id) => api.delete(`/violations/${id}`),
};

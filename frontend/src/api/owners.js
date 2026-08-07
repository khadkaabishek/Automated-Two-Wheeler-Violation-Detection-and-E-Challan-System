import { api } from './client';

export const ownerApi = {
  list: (query) => api.get('/owners', query),
  get: (id) => api.get(`/owners/${id}`),
  create: (payload) => api.post('/owners', payload),
  update: (id, payload) => api.patch(`/owners/${id}`, payload),
  remove: (id) => api.delete(`/owners/${id}`),
  // Self-service - any authenticated user manages their own linked profile
  getMe: () => api.get('/owners/me'),
  createMe: (payload) => api.post('/owners/me', payload),
  updateMe: (payload) => api.patch('/owners/me', payload),
};

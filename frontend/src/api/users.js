import { api } from './client';

export const userApi = {
  list: (query) => api.get('/users', query),
  get: (id) => api.get(`/users/${id}`),
  create: (payload) => api.post('/users', payload),
  update: (id, payload) => api.patch(`/users/${id}`, payload),
  remove: (id) => api.delete(`/users/${id}`),
  activate: (id) => api.patch(`/users/${id}/activate`),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  uploadAvatar: (id, file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.postForm(`/users/${id}/avatar`, form);
  },
};

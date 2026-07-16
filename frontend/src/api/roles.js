import { api } from './client';

export const roleApi = {
  listPermissions: () => api.get('/roles/permissions'),
  list: (query) => api.get('/roles', query),
  get: (id) => api.get(`/roles/${id}`),
  create: (payload) => api.post('/roles', payload),
  update: (id, payload) => api.patch(`/roles/${id}`, payload),
  remove: (id) => api.delete(`/roles/${id}`),
  assignPermissions: (id, permissionIds) => api.put(`/roles/${id}/permissions`, { permissionIds }),
};

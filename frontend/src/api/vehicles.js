import { api } from './client';

export const vehicleApi = {
  list: (query) => api.get('/vehicles', query),
  get: (id) => api.get(`/vehicles/${id}`),
  create: (payload) => api.post('/vehicles', payload),
  update: (id, payload) => api.patch(`/vehicles/${id}`, payload),
  remove: (id) => api.delete(`/vehicles/${id}`),
  setStatus: (id, status) => api.patch(`/vehicles/${id}/status`, { status }),
  approve: (id) => api.patch(`/vehicles/${id}/approve`),
  reject: (id) => api.patch(`/vehicles/${id}/reject`),
  uploadImage: (id, file) => {
    const form = new FormData();
    form.append('vehicleImage', file);
    return api.postForm(`/vehicles/${id}/image`, form);
  },
};

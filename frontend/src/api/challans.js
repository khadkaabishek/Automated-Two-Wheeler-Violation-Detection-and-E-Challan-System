import { api } from './client';

export const challanApi = {
  list: (query) => api.get('/challans', query),
  get: (id) => api.get(`/challans/${id}`),
  create: (payload) => api.post('/challans', payload),
  update: (id, payload) => api.patch(`/challans/${id}`, payload),
  remove: (id) => api.delete(`/challans/${id}`),
  approve: (id) => api.patch(`/challans/${id}/approve`),
  reject: (id) => api.patch(`/challans/${id}/reject`),
  close: (id) => api.patch(`/challans/${id}/close`),
  cancel: (id) => api.patch(`/challans/${id}/cancel`),
  uploadEvidence: (id, images = [], videos = []) => {
    const form = new FormData();
    images.forEach((f) => form.append('evidenceImage', f));
    videos.forEach((f) => form.append('evidenceVideo', f));
    return api.postForm(`/challans/${id}/evidence`, form);
  },
};

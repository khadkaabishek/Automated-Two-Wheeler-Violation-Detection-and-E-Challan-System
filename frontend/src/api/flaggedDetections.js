import { api } from './client';

export const flaggedDetectionApi = {
  list: (query) => api.get('/flagged-detections', query),
  get: (id) => api.get(`/flagged-detections/${id}`),
  submit: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.postForm('/flagged-detections', form);
  },
  submitVideo: (file) => {
    const form = new FormData();
    form.append('video', file);
    return api.postForm('/flagged-detections/video', form);
  },
  dismiss: (id) => api.patch(`/flagged-detections/${id}/dismiss`),
};

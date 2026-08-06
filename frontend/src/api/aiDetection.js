import { api } from './client';

export const aiDetectionApi = {
  status: () => api.get('/ai-detection/status'),
  uploadVideo: (formData) => api.postForm('/ai-detection/upload-video', formData),
};

import { api } from './client';

export const aiDetectionApi = {
  status: () => api.get('/ai-detection/status'),
  uploadVideo: (formData) => api.postForm('/ai-detection/upload-video', formData),
  listDetections: (status = 'PENDING') => api.get('/ai-detection/detections', { status }),
  updateDetection: (id, status) => api.patch(`/ai-detection/detections/${id}`, { status }),
  discardAll: () => api.post('/ai-detection/detections/discard-all'),
};

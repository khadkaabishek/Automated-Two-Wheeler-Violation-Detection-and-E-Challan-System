import { api } from './client';

export const aiDetectionApi = {
  status: () => api.get('/ai-detection/status'),
};

import { api } from './client';

export const aiDetectionApi = {
  status: () => api.get('/ai-detection/status'),
  analyze: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.postForm('/ai-detection/analyze', form);
  },
};

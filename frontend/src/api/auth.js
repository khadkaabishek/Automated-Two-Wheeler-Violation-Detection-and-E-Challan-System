import { api, tokenStore } from './client';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (payload) => api.post('/auth/register', payload),
  logout: async () => {
    const refreshToken = tokenStore.getRefresh();
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      tokenStore.clear();
    }
  },
  me: () => api.get('/auth/profile'),
  updateProfile: (payload) => api.patch('/auth/profile', payload),
  changePassword: (payload) => api.post('/auth/change-password', payload),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

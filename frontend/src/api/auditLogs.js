import { api } from './client';

export const auditLogApi = {
  list: (query) => api.get('/audit-logs', query),
};

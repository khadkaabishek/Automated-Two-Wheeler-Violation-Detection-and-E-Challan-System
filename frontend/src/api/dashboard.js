import { api } from './client';

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
  monthlyRevenue: (year) => api.get('/dashboard/revenue/monthly', { year }),
  dailyChallans: (days) => api.get('/dashboard/challans/daily', { days }),
  topViolations: () => api.get('/dashboard/violations/top'),
  challansByOfficer: () => api.get('/dashboard/challans/by-officer'),
};

import apiClient from './client';
import type { ApiResponse, DashboardStatsResponse } from '@/lib/types';

export const dashboardApi = {
  getStats: async () => {
    const res = await apiClient.get<ApiResponse<DashboardStatsResponse>>('/dashboard/stats');
    return res.data.data;
  },
};

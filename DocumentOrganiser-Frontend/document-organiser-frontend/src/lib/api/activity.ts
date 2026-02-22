import apiClient from './client';
import type { ApiResponse, ActivityResponse, PagedResponse, ActivityType } from '@/lib/types';

export const activityApi = {
  list: async (type?: ActivityType, page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<ActivityResponse>>>('/activity', {
      params: { type, page, size },
    });
    return res.data.data;
  },
};

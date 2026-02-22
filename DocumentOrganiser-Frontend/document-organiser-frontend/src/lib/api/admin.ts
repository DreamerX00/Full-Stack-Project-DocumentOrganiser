import apiClient from './client';
import type { ApiResponse, PagedResponse, UserResponse } from '@/lib/types';

export interface SystemStats {
  totalUsers: number;
  totalDocuments: number;
  totalFolders: number;
}

export const adminApi = {
  listUsers: async (page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<UserResponse>>>('/admin/users', {
      params: { page, size, sort: 'createdAt,desc' },
    });
    return res.data.data;
  },

  getSystemStats: async () => {
    const res = await apiClient.get<ApiResponse<SystemStats>>('/admin/stats');
    return res.data.data;
  },

  changeUserRole: async (userId: string, role: 'USER' | 'ADMIN') => {
    const res = await apiClient.put<ApiResponse<UserResponse>>(
      `/admin/users/${userId}/role`,
      null,
      { params: { role } }
    );
    return res.data.data;
  },

  deleteUser: async (userId: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/admin/users/${userId}`);
    return res.data;
  },
};

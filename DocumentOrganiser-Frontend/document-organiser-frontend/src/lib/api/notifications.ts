import apiClient from './client';
import type {
  ApiResponse,
  NotificationResponse,
  PagedResponse,
} from '@/lib/types';

export const notificationsApi = {
  list: async (page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<NotificationResponse>>>(
      '/notifications',
      { params: { page, size } }
    );
    return res.data.data;
  },

  listUnread: async (page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<NotificationResponse>>>(
      '/notifications/unread',
      { params: { page, size } }
    );
    return res.data.data;
  },

  getUnreadCount: async () => {
    const res = await apiClient.get<ApiResponse<number>>('/notifications/unread/count');
    return res.data.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.put<ApiResponse<null>>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.put<ApiResponse<null>>('/notifications/read-all');
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/notifications/${id}`);
    return res.data;
  },
};

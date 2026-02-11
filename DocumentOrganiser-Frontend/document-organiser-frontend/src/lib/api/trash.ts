import apiClient from './client';
import type {
  ApiResponse,
  TrashItemResponse,
  PagedResponse,
} from '@/lib/types';

export const trashApi = {
  list: async (page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<TrashItemResponse>>>('/trash', {
      params: { page, size },
    });
    return res.data.data;
  },

  restore: async (trashItemId: string) => {
    const res = await apiClient.post<ApiResponse<null>>(`/trash/${trashItemId}/restore`);
    return res.data;
  },

  deletePermanently: async (trashItemId: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/trash/${trashItemId}`);
    return res.data;
  },

  emptyTrash: async () => {
    const res = await apiClient.delete<ApiResponse<null>>('/trash/empty');
    return res.data;
  },
};

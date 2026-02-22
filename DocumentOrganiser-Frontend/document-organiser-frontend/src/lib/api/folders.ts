import apiClient from './client';
import type {
  ApiResponse,
  FolderResponse,
  FolderTreeResponse,
  PagedResponse,
  CreateFolderRequest,
  UpdateFolderRequest,
  MoveFolderRequest,
} from '@/lib/types';

export const foldersApi = {
  create: async (data: CreateFolderRequest) => {
    const res = await apiClient.post<ApiResponse<FolderResponse>>('/folders', data);
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<FolderResponse>>(`/folders/${id}`);
    return res.data.data;
  },

  update: async (id: string, data: UpdateFolderRequest) => {
    const res = await apiClient.put<ApiResponse<FolderResponse>>(`/folders/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/folders/${id}`);
    return res.data;
  },

  move: async (id: string, data: MoveFolderRequest) => {
    const res = await apiClient.post<ApiResponse<FolderResponse>>(`/folders/${id}/move`, data);
    return res.data.data;
  },

  listRootFolders: async () => {
    const res = await apiClient.get<ApiResponse<FolderResponse[]>>('/folders/root');
    return res.data.data;
  },

  listSubfolders: async (parentId: string) => {
    const res = await apiClient.get<ApiResponse<FolderResponse[]>>(`/folders/${parentId}/children`);
    return res.data.data;
  },

  getFolderTree: async () => {
    const res = await apiClient.get<ApiResponse<FolderTreeResponse>>('/folders/tree');
    return res.data.data;
  },

  searchFolders: async (query: string, page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<FolderResponse>>>('/folders/search', {
      params: { query, page, size },
    });
    return res.data.data;
  },
};

import apiClient from './client';
import type {
  ApiResponse,
  FolderResponse,
  FolderTreeResponse,
  PagedResponse,
  CreateFolderRequest,
  UpdateFolderRequest,
  MoveFolderRequest,
  DocumentResponse,
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
    const res = await apiClient.get<ApiResponse<FolderResponse[]>>(
      `/folders/${parentId}/subfolders`
    );
    return res.data.data;
  },

  getFolderTree: async () => {
    const res = await apiClient.get<ApiResponse<FolderTreeResponse[]>>('/folders/tree');
    return res.data.data;
  },

  getContents: async (
    folderId: string,
    page = 0,
    size = 20,
    sortBy = 'updatedAt',
    sortDir = 'desc'
  ) => {
    const res = await apiClient.get<
      ApiResponse<PagedResponse<DocumentResponse>>
    >(`/folders/${folderId}/contents`, {
      params: { page, size, sort: `${sortBy},${sortDir}` },
    });
    return res.data.data;
  },
};

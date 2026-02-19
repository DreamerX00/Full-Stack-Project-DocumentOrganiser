import apiClient from './client';
import type {
  ApiResponse,
  DocumentResponse,
  DocumentVersionResponse,
  PagedResponse,
  RenameDocumentRequest,
  MoveDocumentRequest,
  DocumentCategory,
} from '@/lib/types';

// Map UI sort field names to backend entity field names
const SORT_FIELD_MAP: Record<string, string> = {
  date: 'updatedAt',
  name: 'name',
  size: 'fileSize',
  type: 'fileType',
};

function mapSortField(field: string): string {
  return SORT_FIELD_MAP[field] || field;
}

export const documentsApi = {
  upload: async (file: File, folderId?: string, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);

    const res = await apiClient.post<ApiResponse<DocumentResponse>>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<DocumentResponse>>(`/documents/${id}`);
    return res.data.data;
  },

  download: async (id: string) => {
    const res = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return res.data;
  },

  getPreviewUrl: async (id: string) => {
    const res = await apiClient.get<ApiResponse<string>>(`/documents/${id}/preview`);
    return res.data.data;
  },

  rename: async (id: string, data: RenameDocumentRequest) => {
    const res = await apiClient.put<ApiResponse<DocumentResponse>>(`/documents/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/documents/${id}`);
    return res.data;
  },

  move: async (id: string, data: MoveDocumentRequest) => {
    const res = await apiClient.post<ApiResponse<DocumentResponse>>(
      `/documents/${id}/move`,
      data
    );
    return res.data.data;
  },

  copy: async (id: string, targetFolderId?: string) => {
    const res = await apiClient.post<ApiResponse<DocumentResponse>>(
      `/documents/${id}/copy`,
      null,
      { params: { targetFolderId } }
    );
    return res.data.data;
  },

  toggleFavorite: async (id: string) => {
    const res = await apiClient.post<ApiResponse<DocumentResponse>>(
      `/documents/${id}/favorite`
    );
    return res.data.data;
  },

  listByFolder: async (
    folderId?: string,
    page = 0,
    size = 20,
    sortBy = 'updatedAt',
    sortDir = 'desc'
  ) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<DocumentResponse>>>('/documents', {
      params: { folderId, page, size, sort: `${mapSortField(sortBy)},${sortDir}` },
    });
    return res.data.data;
  },

  listByCategory: async (category: DocumentCategory, page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<DocumentResponse>>>(
      `/documents/category/${category}`,
      { params: { page, size } }
    );
    return res.data.data;
  },

  listRecent: async (page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<DocumentResponse>>>(
      '/documents/recent',
      { params: { page, size } }
    );
    return res.data.data;
  },

  listFavorites: async (page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<DocumentResponse>>>(
      '/documents/favorites',
      { params: { page, size } }
    );
    return res.data.data;
  },

  search: async (query: string, page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<DocumentResponse>>>(
      '/documents/search',
      { params: { query, page, size } }
    );
    return res.data.data;
  },

  addTag: async (id: string, tag: string) => {
    const res = await apiClient.post<ApiResponse<null>>(
      `/documents/${id}/tags`,
      null,
      { params: { tag } }
    );
    return res.data;
  },

  removeTag: async (id: string, tag: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/documents/${id}/tags/${tag}`);
    return res.data;
  },

  getAllTags: async () => {
    const res = await apiClient.get<ApiResponse<string[]>>('/documents/tags');
    return res.data.data;
  },

  // Version management
  getVersions: async (id: string) => {
    const res = await apiClient.get<ApiResponse<DocumentVersionResponse[]>>(`/documents/${id}/versions`);
    return res.data.data;
  },

  restoreVersion: async (id: string, versionNumber: number) => {
    const res = await apiClient.post<ApiResponse<DocumentResponse>>(
      `/documents/${id}/versions/${versionNumber}/restore`
    );
    return res.data.data;
  },
};

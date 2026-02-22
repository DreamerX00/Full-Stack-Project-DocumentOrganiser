import apiClient from './client';
import type {
  ApiResponse,
  SearchResultResponse,
  DocumentResponse,
  FolderResponse,
  PagedResponse,
  DocumentCategory,
} from '@/lib/types';

export const searchApi = {
  /** GET /search — returns combined documents + folders */
  search: async (query: string, limit = 10) => {
    const res = await apiClient.get<ApiResponse<SearchResultResponse>>('/search', {
      params: { q: query, limit },
    });
    return res.data.data;
  },

  /** GET /search/documents — paginated document search with optional filters */
  searchDocuments: async (
    query: string,
    category?: DocumentCategory,
    contentType?: string,
    page = 0,
    size = 20
  ) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<DocumentResponse>>>(
      '/search/documents',
      { params: { q: query, category, types: contentType, page, size } }
    );
    return res.data.data;
  },

  /** GET /search/folders — paginated folder search */
  searchFolders: async (query: string, page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<FolderResponse>>>('/search/folders', {
      params: { q: query, page, size },
    });
    return res.data.data;
  },

  /** GET /search/suggestions — returns list of name strings */
  suggest: async (query: string, limit = 10) => {
    const res = await apiClient.get<ApiResponse<string[]>>('/search/suggestions', {
      params: { q: query, limit },
    });
    return res.data.data;
  },
};

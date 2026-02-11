import apiClient from './client';
import type {
  ApiResponse,
  SearchResultResponse,
  DocumentResponse,
  PagedResponse,
  DocumentCategory,
} from '@/lib/types';

export const searchApi = {
  suggest: async (query: string, limit = 10) => {
    const res = await apiClient.get<ApiResponse<SearchResultResponse[]>>('/search/suggest', {
      params: { query, limit },
    });
    return res.data.data;
  },

  search: async (
    query: string,
    category?: DocumentCategory,
    contentType?: string,
    page = 0,
    size = 20
  ) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<DocumentResponse>>>('/search', {
      params: { query, category, contentType, page, size },
    });
    return res.data.data;
  },

  searchByTags: async (tags: string, page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<DocumentResponse>>>(
      '/search/tags',
      { params: { tags, page, size } }
    );
    return res.data.data;
  },

  recentSearches: async (query?: string, limit = 10) => {
    const res = await apiClient.get<ApiResponse<string[]>>('/search/recent', {
      params: { query, limit },
    });
    return res.data.data;
  },
};

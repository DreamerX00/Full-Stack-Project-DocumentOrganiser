import apiClient from './client';
import type { ApiResponse } from '@/lib/types';

export const exportApi = {
  downloadAll: async () => {
    const res = await apiClient.get('/export/documents', {
      responseType: 'blob',
    });
    return res.data as Blob;
  },
};

export interface AiSuggestTagsResult {
  tags: string[];
}

export const aiApi = {
  autoTag: async (documentId: string) => {
    const res = await apiClient.post<ApiResponse<string[]>>(`/ai/documents/${documentId}/auto-tag`);
    return res.data.data;
  },

  suggestTags: async (documentId: string) => {
    const res = await apiClient.get<ApiResponse<string[]>>(
      `/ai/documents/${documentId}/suggest-tags`
    );
    return res.data.data;
  },

  summarize: async (documentId: string) => {
    const res = await apiClient.post<ApiResponse<{ documentId: string; summary: string }>>(
      `/ai/documents/${documentId}/summarize`
    );
    return res.data.data;
  },
};

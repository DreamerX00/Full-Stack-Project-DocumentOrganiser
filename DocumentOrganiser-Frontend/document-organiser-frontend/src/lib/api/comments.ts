import apiClient from './client';
import type { ApiResponse, PagedResponse } from '@/lib/types';

export interface CommentResponse {
    id: string;
    documentId: string;
    content: string;
    authorName: string;
    authorEmail: string;
    parentId: string | null;
    createdAt: string;
}

export const commentsApi = {
    list: async (documentId: string, page = 0, size = 20) => {
        const res = await apiClient.get<ApiResponse<PagedResponse<CommentResponse>>>(
            `/documents/${documentId}/comments`,
            { params: { page, size } }
        );
        return res.data.data;
    },

    add: async (documentId: string, content: string, parentId?: string) => {
        const res = await apiClient.post<ApiResponse<CommentResponse>>(
            `/documents/${documentId}/comments`,
            { content, parentId }
        );
        return res.data.data;
    },

    delete: async (documentId: string, commentId: string) => {
        const res = await apiClient.delete<ApiResponse<null>>(
            `/documents/${documentId}/comments/${commentId}`
        );
        return res.data;
    },
};

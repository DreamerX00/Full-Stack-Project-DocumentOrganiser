import apiClient from './client';
import type {
  ApiResponse,
  SharedItemResponse,
  ShareLinkResponse,
  PagedResponse,
  ShareWithUserRequest,
  CreateShareLinkRequest,
  PublicShareResponse,
} from '@/lib/types';

export const sharesApi = {
  shareDocumentWithUser: async (documentId: string, data: ShareWithUserRequest) => {
    const res = await apiClient.post<ApiResponse<SharedItemResponse>>(
      `/documents/${documentId}/share`,
      data
    );
    return res.data.data;
  },

  shareFolderWithUser: async (folderId: string, data: ShareWithUserRequest) => {
    const res = await apiClient.post<ApiResponse<SharedItemResponse>>(
      `/folders/${folderId}/share`,
      data
    );
    return res.data.data;
  },

  createDocumentShareLink: async (documentId: string, data: CreateShareLinkRequest) => {
    const res = await apiClient.post<ApiResponse<ShareLinkResponse>>(
      `/documents/${documentId}/share-link`,
      data
    );
    return res.data.data;
  },

  createFolderShareLink: async (folderId: string, data: CreateShareLinkRequest) => {
    const res = await apiClient.post<ApiResponse<ShareLinkResponse>>(
      `/folders/${folderId}/share-link`,
      data
    );
    return res.data.data;
  },

  getDocumentShares: async (documentId: string, page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<SharedItemResponse>>>(
      `/documents/${documentId}/shares`,
      { params: { page, size } }
    );
    return res.data.data;
  },

  getFolderShares: async (folderId: string, page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<SharedItemResponse>>>(
      `/folders/${folderId}/shares`,
      { params: { page, size } }
    );
    return res.data.data;
  },

  getSharedWithMe: async (page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<SharedItemResponse>>>(
      '/documents/shared-with-me',
      { params: { page, size } }
    );
    return res.data.data;
  },

  getSharedByMe: async (page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<SharedItemResponse>>>(
      '/documents/shared-by-me',
      { params: { page, size } }
    );
    return res.data.data;
  },

  revokeDocumentShare: async (shareId: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/documents/shares/${shareId}`);
    return res.data;
  },

  revokeFolderShare: async (shareId: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/folders/shares/${shareId}`);
    return res.data;
  },

  getShareLinks: async (page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<ShareLinkResponse>>>(
      '/shares/links',
      { params: { page, size } }
    );
    return res.data.data;
  },

  revokeShareLink: async (linkId: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/shares/links/${linkId}`);
    return res.data;
  },

  // Public share (no auth)
  getPublicShare: async (token: string, password?: string) => {
    const res = await apiClient.get<ApiResponse<PublicShareResponse>>(`/share/${token}`, {
      params: { password },
    });
    return res.data.data;
  },

  downloadPublicShare: async (token: string, password?: string) => {
    const res = await apiClient.get(`/share/${token}/download`, {
      params: { password },
      responseType: 'blob',
    });
    return res.data;
  },
};

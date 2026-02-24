import apiClient from './client';
import type {
  ApiResponse,
  SharedItemResponse,
  ShareLinkResponse,
  PagedResponse,
  ShareWithUserRequest,
  CreateShareLinkRequest,
  DocumentResponse,
  FolderResponse,
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
      `/documents/${documentId}/share/link`,
      data
    );
    return res.data.data;
  },

  createFolderShareLink: async (folderId: string, data: CreateShareLinkRequest) => {
    const res = await apiClient.post<ApiResponse<ShareLinkResponse>>(
      `/folders/${folderId}/share/link`,
      data
    );
    return res.data.data;
  },

  getDocumentsSharedWithMe: async (page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<SharedItemResponse>>>(
      '/documents/shared-with-me',
      { params: { page, size } }
    );
    return res.data.data;
  },

  getFoldersSharedWithMe: async (page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<SharedItemResponse>>>(
      '/folders/shared-with-me',
      { params: { page, size } }
    );
    return res.data.data;
  },

  getDocumentsSharedByMe: async (page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<SharedItemResponse>>>(
      '/documents/shared-by-me',
      { params: { page, size } }
    );
    return res.data.data;
  },

  getFoldersSharedByMe: async (page = 0, size = 20) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<SharedItemResponse>>>(
      '/folders/shared-by-me',
      { params: { page, size } }
    );
    return res.data.data;
  },

  revokeDocumentShare: async (shareId: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/shares/documents/${shareId}`);
    return res.data;
  },

  revokeFolderShare: async (shareId: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/shares/folders/${shareId}`);
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

  // Public share (no auth) — backend returns DocumentResponse
  getPublicShare: async (token: string, password?: string) => {
    const res = await apiClient.get<ApiResponse<DocumentResponse>>(`/share/${token}`, {
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

  // Public folder share (no auth)
  getShareLinkType: async (token: string, password?: string): Promise<'DOCUMENT' | 'FOLDER'> => {
    const res = await apiClient.get<ApiResponse<{ type: 'DOCUMENT' | 'FOLDER' }>>(
      `/share/${token}/type`,
      { params: { password } }
    );
    return res.data.data.type;
  },

  getPublicFolderShare: async (token: string, password?: string): Promise<FolderResponse> => {
    const res = await apiClient.get<ApiResponse<FolderResponse>>(`/share/${token}/folder`, {
      params: { password },
    });
    return res.data.data;
  },

  getPublicFolderDocuments: async (
    token: string,
    password?: string
  ): Promise<DocumentResponse[]> => {
    const res = await apiClient.get<ApiResponse<DocumentResponse[]>>(
      `/share/${token}/folder/documents`,
      { params: { password } }
    );
    return res.data.data;
  },
};

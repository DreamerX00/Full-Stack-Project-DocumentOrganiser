import apiClient from './client';
import type { ApiResponse } from '@/lib/types';

export interface ViewerSummary {
  userId: string;
  userName: string;
  userEmail: string;
  profilePicture?: string;
  lastHeartbeat: string;
}

export interface PresenceEvent {
  type: 'VIEWER_JOINED' | 'VIEWER_LEFT';
  documentId: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export const presenceApi = {
  /**
   * Get list of users currently viewing a document
   */
  getViewers: async (documentId: string): Promise<ViewerSummary[]> => {
    const res = await apiClient.get<ApiResponse<ViewerSummary[]>>(
      `/documents/${documentId}/viewers`
    );
    return res.data.data;
  },

  /**
   * Send a heartbeat to indicate the user is still viewing
   */
  heartbeat: async (documentId: string): Promise<void> => {
    await apiClient.post(`/documents/${documentId}/viewers/heartbeat`);
  },

  /**
   * Notify that the user has left the document view
   */
  leave: async (documentId: string): Promise<void> => {
    await apiClient.post(`/documents/${documentId}/viewers/leave`);
  },
};

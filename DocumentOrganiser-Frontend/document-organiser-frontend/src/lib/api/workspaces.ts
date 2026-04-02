import apiClient from './client';
import type {
  ApiResponse,
  PagedResponse,
  WorkspaceResponse,
  WorkspaceMemberResponse,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  InviteWorkspaceMemberRequest,
  UpdateMemberRoleRequest,
  WorkspaceRole,
} from '@/lib/types';

export const workspacesApi = {
  // ============================================================
  // Workspace CRUD
  // ============================================================

  /**
   * Create a new workspace
   */
  create: async (data: CreateWorkspaceRequest): Promise<WorkspaceResponse> => {
    const res = await apiClient.post<ApiResponse<WorkspaceResponse>>('/workspaces', data);
    return res.data.data;
  },

  /**
   * Get all workspaces for the current user
   */
  list: async (page = 0, size = 20): Promise<PagedResponse<WorkspaceResponse>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<WorkspaceResponse>>>(
      '/workspaces',
      { params: { page, size } }
    );
    return res.data.data;
  },

  /**
   * Get a specific workspace by ID
   */
  get: async (workspaceId: string): Promise<WorkspaceResponse> => {
    const res = await apiClient.get<ApiResponse<WorkspaceResponse>>(
      `/workspaces/${workspaceId}`
    );
    return res.data.data;
  },

  /**
   * Update workspace details
   */
  update: async (
    workspaceId: string,
    data: UpdateWorkspaceRequest
  ): Promise<WorkspaceResponse> => {
    const res = await apiClient.patch<ApiResponse<WorkspaceResponse>>(
      `/workspaces/${workspaceId}`,
      data
    );
    return res.data.data;
  },

  /**
   * Delete a workspace (owner only)
   */
  delete: async (workspaceId: string): Promise<void> => {
    await apiClient.delete(`/workspaces/${workspaceId}`);
  },

  // ============================================================
  // Member Management
  // ============================================================

  /**
   * Get all members of a workspace
   */
  getMembers: async (
    workspaceId: string,
    page = 0,
    size = 20
  ): Promise<PagedResponse<WorkspaceMemberResponse>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<WorkspaceMemberResponse>>>(
      `/workspaces/${workspaceId}/members`,
      { params: { page, size } }
    );
    return res.data.data;
  },

  /**
   * Invite a user to a workspace
   */
  inviteMember: async (
    workspaceId: string,
    data: InviteWorkspaceMemberRequest
  ): Promise<WorkspaceMemberResponse> => {
    const res = await apiClient.post<ApiResponse<WorkspaceMemberResponse>>(
      `/workspaces/${workspaceId}/members`,
      data
    );
    return res.data.data;
  },

  /**
   * Update a member's role
   */
  updateMemberRole: async (
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole
  ): Promise<WorkspaceMemberResponse> => {
    const res = await apiClient.patch<ApiResponse<WorkspaceMemberResponse>>(
      `/workspaces/${workspaceId}/members/${memberId}`,
      { role } as UpdateMemberRoleRequest
    );
    return res.data.data;
  },

  /**
   * Remove a member from a workspace
   */
  removeMember: async (workspaceId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },

  /**
   * Leave a workspace (for non-owners)
   */
  leave: async (workspaceId: string): Promise<void> => {
    await apiClient.post(`/workspaces/${workspaceId}/leave`);
  },
};

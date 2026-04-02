import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi } from '@/lib/api/workspaces';
import type {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  InviteWorkspaceMemberRequest,
  WorkspaceRole,
} from '@/lib/types';
import { toast } from 'sonner';

const WORKSPACE_KEYS = {
  all: ['workspaces'] as const,
  lists: () => [...WORKSPACE_KEYS.all, 'list'] as const,
  list: (page: number) => [...WORKSPACE_KEYS.lists(), page] as const,
  details: () => [...WORKSPACE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...WORKSPACE_KEYS.details(), id] as const,
  members: (id: string) => [...WORKSPACE_KEYS.detail(id), 'members'] as const,
  memberList: (id: string, page: number) => [...WORKSPACE_KEYS.members(id), page] as const,
};

/**
 * Hook for fetching the list of workspaces
 */
export function useWorkspaces(page = 0, size = 20) {
  return useQuery({
    queryKey: WORKSPACE_KEYS.list(page),
    queryFn: () => workspacesApi.list(page, size),
  });
}

/**
 * Hook for fetching a single workspace
 */
export function useWorkspace(workspaceId: string | undefined) {
  return useQuery({
    queryKey: WORKSPACE_KEYS.detail(workspaceId ?? ''),
    queryFn: () => workspacesApi.get(workspaceId!),
    enabled: !!workspaceId,
  });
}

/**
 * Hook for fetching workspace members
 */
export function useWorkspaceMembers(workspaceId: string | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: WORKSPACE_KEYS.memberList(workspaceId ?? '', page),
    queryFn: () => workspacesApi.getMembers(workspaceId!, page, size),
    enabled: !!workspaceId,
  });
}

/**
 * Hook for workspace mutations (create, update, delete)
 */
export function useWorkspaceMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateWorkspaceRequest) => workspacesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.lists() });
      toast.success('Workspace created');
    },
    onError: () => {
      toast.error('Failed to create workspace');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkspaceRequest }) =>
      workspacesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.lists() });
      toast.success('Workspace updated');
    },
    onError: () => {
      toast.error('Failed to update workspace');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workspacesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.all });
      toast.success('Workspace deleted');
    },
    onError: () => {
      toast.error('Failed to delete workspace');
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
}

/**
 * Hook for workspace member mutations
 */
export function useWorkspaceMemberMutations(workspaceId: string) {
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: (data: InviteWorkspaceMemberRequest) =>
      workspacesApi.inviteMember(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.members(workspaceId) });
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.detail(workspaceId) });
      toast.success('Member invited');
    },
    onError: () => {
      toast.error('Failed to invite member');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: WorkspaceRole }) =>
      workspacesApi.updateMemberRole(workspaceId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.members(workspaceId) });
      toast.success('Member role updated');
    },
    onError: () => {
      toast.error('Failed to update member role');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => workspacesApi.removeMember(workspaceId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.members(workspaceId) });
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.detail(workspaceId) });
      toast.success('Member removed');
    },
    onError: () => {
      toast.error('Failed to remove member');
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => workspacesApi.leave(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.all });
      toast.success('Left workspace');
    },
    onError: () => {
      toast.error('Failed to leave workspace');
    },
  });

  return {
    invite: inviteMutation,
    updateRole: updateRoleMutation,
    remove: removeMutation,
    leave: leaveMutation,
  };
}

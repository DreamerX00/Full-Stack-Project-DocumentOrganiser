import { useMemo } from 'react';
import { SharePermission, type WorkspaceRole } from '@/lib/types';

/**
 * Permission levels for workspaces, in order of increasing privilege
 */
const WORKSPACE_ROLE_LEVELS: Record<WorkspaceRole, number> = {
  VIEWER: 1,
  MEMBER: 2,
  ADMIN: 3,
  OWNER: 4,
};

/**
 * Permission levels for shares, in order of increasing privilege
 */
const SHARE_PERMISSION_LEVELS: Record<SharePermission, number> = {
  [SharePermission.VIEW]: 1,
  [SharePermission.DOWNLOAD]: 2,
  [SharePermission.EDIT]: 3,
};

interface WorkspacePermissions {
  /** Can view workspace content */
  canView: boolean;
  /** Can create/edit documents and folders */
  canEdit: boolean;
  /** Can manage (invite/remove) members */
  canManageMembers: boolean;
  /** Can update workspace settings */
  canUpdateSettings: boolean;
  /** Can delete the workspace */
  canDelete: boolean;
  /** Can leave the workspace */
  canLeave: boolean;
  /** Check if user has at least the specified role */
  hasRole: (requiredRole: WorkspaceRole) => boolean;
}

interface SharePermissions {
  /** Can view the shared item */
  canView: boolean;
  /** Can download the shared item */
  canDownload: boolean;
  /** Can edit the shared item */
  canEdit: boolean;
  /** Check if user has at least the specified permission */
  hasPermission: (requiredPermission: SharePermission) => boolean;
}

/**
 * Hook for checking workspace permissions based on the user's role
 */
export function useWorkspacePermissions(role: WorkspaceRole | undefined): WorkspacePermissions {
  return useMemo(() => {
    const hasRole = (requiredRole: WorkspaceRole): boolean => {
      if (!role) return false;
      return WORKSPACE_ROLE_LEVELS[role] >= WORKSPACE_ROLE_LEVELS[requiredRole];
    };

    return {
      canView: hasRole('VIEWER'),
      canEdit: hasRole('MEMBER'),
      canManageMembers: hasRole('ADMIN'),
      canUpdateSettings: hasRole('ADMIN'),
      canDelete: role === 'OWNER',
      canLeave: role !== 'OWNER' && !!role,
      hasRole,
    };
  }, [role]);
}

/**
 * Hook for checking share permissions
 */
export function useSharePermissions(permission: SharePermission | undefined): SharePermissions {
  return useMemo(() => {
    const hasPermission = (requiredPermission: SharePermission): boolean => {
      if (!permission) return false;
      return SHARE_PERMISSION_LEVELS[permission] >= SHARE_PERMISSION_LEVELS[requiredPermission];
    };

    return {
      canView: hasPermission(SharePermission.VIEW),
      canDownload: hasPermission(SharePermission.DOWNLOAD),
      canEdit: hasPermission(SharePermission.EDIT),
      hasPermission,
    };
  }, [permission]);
}

/**
 * Check if a user can perform an action on a document/folder
 * based on ownership or share permissions
 */
interface DocumentPermissions {
  /** User owns the document */
  isOwner: boolean;
  /** User can view the document */
  canView: boolean;
  /** User can download the document */
  canDownload: boolean;
  /** User can edit the document */
  canEdit: boolean;
  /** User can delete the document */
  canDelete: boolean;
  /** User can share the document */
  canShare: boolean;
  /** User can comment on the document */
  canComment: boolean;
}

interface UseDocumentPermissionsParams {
  /** Current user's ID */
  userId?: string;
  /** Document owner's ID */
  ownerId?: string;
  /** Share permission if the document is shared with the user */
  sharePermission?: SharePermission;
  /** Workspace role if the document is in a workspace */
  workspaceRole?: WorkspaceRole;
}

export function useDocumentPermissions({
  userId,
  ownerId,
  sharePermission,
  workspaceRole,
}: UseDocumentPermissionsParams): DocumentPermissions {
  return useMemo(() => {
    const isOwner = !!userId && !!ownerId && userId === ownerId;

    // Owner has all permissions
    if (isOwner) {
      return {
        isOwner: true,
        canView: true,
        canDownload: true,
        canEdit: true,
        canDelete: true,
        canShare: true,
        canComment: true,
      };
    }

    // Check workspace permissions
    if (workspaceRole) {
      const workspaceLevel = WORKSPACE_ROLE_LEVELS[workspaceRole];
      return {
        isOwner: false,
        canView: workspaceLevel >= WORKSPACE_ROLE_LEVELS.VIEWER,
        canDownload: workspaceLevel >= WORKSPACE_ROLE_LEVELS.VIEWER,
        canEdit: workspaceLevel >= WORKSPACE_ROLE_LEVELS.MEMBER,
        canDelete: workspaceLevel >= WORKSPACE_ROLE_LEVELS.ADMIN,
        canShare: workspaceLevel >= WORKSPACE_ROLE_LEVELS.MEMBER,
        canComment: workspaceLevel >= WORKSPACE_ROLE_LEVELS.VIEWER,
      };
    }

    // Check share permissions
    if (sharePermission) {
      const shareLevel = SHARE_PERMISSION_LEVELS[sharePermission];
      return {
        isOwner: false,
        canView: shareLevel >= SHARE_PERMISSION_LEVELS[SharePermission.VIEW],
        canDownload: shareLevel >= SHARE_PERMISSION_LEVELS[SharePermission.DOWNLOAD],
        canEdit: shareLevel >= SHARE_PERMISSION_LEVELS[SharePermission.EDIT],
        canDelete: false, // Shared users can never delete
        canShare: false, // Shared users can't re-share
        canComment: shareLevel >= SHARE_PERMISSION_LEVELS[SharePermission.VIEW], // Can comment if can view
      };
    }

    // No permissions
    return {
      isOwner: false,
      canView: false,
      canDownload: false,
      canEdit: false,
      canDelete: false,
      canShare: false,
      canComment: false,
    };
  }, [userId, ownerId, sharePermission, workspaceRole]);
}

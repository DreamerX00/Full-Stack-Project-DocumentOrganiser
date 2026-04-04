package com.alphadocuments.documentorganiserbackend.service;

import com.alphadocuments.documentorganiserbackend.dto.request.CreateCustomRoleRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateCustomRoleRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.AvailablePermissionsResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.CustomRoleResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing workspace custom roles.
 */
public interface WorkspaceRoleService {

    /**
     * Get all roles for a workspace.
     */
    List<CustomRoleResponse> getRolesByWorkspace(UUID workspaceId);

    /**
     * Get only custom (non-system) roles for a workspace.
     */
    List<CustomRoleResponse> getCustomRolesByWorkspace(UUID workspaceId);

    /**
     * Get a specific role by ID.
     */
    CustomRoleResponse getRoleById(UUID workspaceId, UUID roleId);

    /**
     * Create a new custom role.
     */
    CustomRoleResponse createRole(UUID workspaceId, CreateCustomRoleRequest request, UUID createdBy);

    /**
     * Update an existing custom role.
     * System roles cannot be updated (except for isDefaultRole).
     */
    CustomRoleResponse updateRole(UUID workspaceId, UUID roleId, UpdateCustomRoleRequest request);

    /**
     * Delete a custom role.
     * System roles cannot be deleted.
     * Roles with assigned members cannot be deleted.
     */
    void deleteRole(UUID workspaceId, UUID roleId);

    /**
     * Get available permissions for role configuration.
     */
    AvailablePermissionsResponse getAvailablePermissions();

    /**
     * Get the default role for a workspace.
     */
    CustomRoleResponse getDefaultRole(UUID workspaceId);

    /**
     * Set a role as the default for new members.
     */
    CustomRoleResponse setDefaultRole(UUID workspaceId, UUID roleId);

    /**
     * Assign a role to a workspace member.
     */
    void assignRoleToMember(UUID workspaceId, UUID memberId, UUID roleId);

    /**
     * Validate a list of permission strings.
     */
    List<String> validatePermissions(List<String> permissions);
}

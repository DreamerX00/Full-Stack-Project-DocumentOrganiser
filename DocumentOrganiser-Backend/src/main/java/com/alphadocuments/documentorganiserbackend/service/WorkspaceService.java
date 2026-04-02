package com.alphadocuments.documentorganiserbackend.service;

import com.alphadocuments.documentorganiserbackend.dto.request.CreateWorkspaceRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.InviteWorkspaceMemberRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateMemberRoleRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateWorkspaceRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.WorkspaceMemberResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.WorkspaceResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service interface for workspace operations.
 */
public interface WorkspaceService {

    WorkspaceResponse createWorkspace(UUID userId, CreateWorkspaceRequest request);

    Page<WorkspaceResponse> getMyWorkspaces(UUID userId, Pageable pageable);

    WorkspaceResponse getWorkspace(UUID userId, UUID workspaceId);

    WorkspaceResponse updateWorkspace(UUID userId, UUID workspaceId, UpdateWorkspaceRequest request);

    void deleteWorkspace(UUID userId, UUID workspaceId);

    // Member management
    Page<WorkspaceMemberResponse> getMembers(UUID userId, UUID workspaceId, Pageable pageable);

    WorkspaceMemberResponse inviteMember(UUID userId, UUID workspaceId, InviteWorkspaceMemberRequest request);

    WorkspaceMemberResponse updateMemberRole(UUID userId, UUID workspaceId, UUID memberId, UpdateMemberRoleRequest request);

    void removeMember(UUID userId, UUID workspaceId, UUID memberId);

    void leaveWorkspace(UUID userId, UUID workspaceId);
}

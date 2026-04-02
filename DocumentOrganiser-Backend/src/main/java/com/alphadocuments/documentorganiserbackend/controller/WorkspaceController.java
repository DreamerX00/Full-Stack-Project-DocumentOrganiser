package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.request.CreateWorkspaceRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.InviteWorkspaceMemberRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateMemberRoleRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateWorkspaceRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.PagedResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.WorkspaceMemberResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.WorkspaceResponse;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.WorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for workspace operations.
 */
@RestController
@RequestMapping("/workspaces")
@RequiredArgsConstructor
@Tag(name = "Workspaces", description = "Workspace management APIs")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    @Operation(summary = "Create workspace", description = "Create a new workspace")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> createWorkspace(
            @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody CreateWorkspaceRequest request) {

        WorkspaceResponse response = workspaceService.createWorkspace(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Workspace created"));
    }

    @GetMapping
    @Operation(summary = "Get my workspaces", description = "Get all workspaces the current user is a member of")
    public ResponseEntity<ApiResponse<PagedResponse<WorkspaceResponse>>> getMyWorkspaces(
            @CurrentUser UserPrincipal userPrincipal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<WorkspaceResponse> page = workspaceService.getMyWorkspaces(userPrincipal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(page)));
    }

    @GetMapping("/{workspaceId}")
    @Operation(summary = "Get workspace", description = "Get workspace details")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> getWorkspace(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID workspaceId) {

        WorkspaceResponse response = workspaceService.getWorkspace(userPrincipal.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{workspaceId}")
    @Operation(summary = "Update workspace", description = "Update workspace settings")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> updateWorkspace(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID workspaceId,
            @Valid @RequestBody UpdateWorkspaceRequest request) {

        WorkspaceResponse response = workspaceService.updateWorkspace(userPrincipal.getId(), workspaceId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Workspace updated"));
    }

    @DeleteMapping("/{workspaceId}")
    @Operation(summary = "Delete workspace", description = "Delete a workspace (owner only)")
    public ResponseEntity<ApiResponse<Void>> deleteWorkspace(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID workspaceId) {

        workspaceService.deleteWorkspace(userPrincipal.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success("Workspace deleted"));
    }

    // === Member Management ===

    @GetMapping("/{workspaceId}/members")
    @Operation(summary = "Get members", description = "Get workspace members")
    public ResponseEntity<ApiResponse<PagedResponse<WorkspaceMemberResponse>>> getMembers(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID workspaceId,
            @PageableDefault(size = 50, sort = "joinedAt", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<WorkspaceMemberResponse> page = workspaceService.getMembers(userPrincipal.getId(), workspaceId, pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(page)));
    }

    @PostMapping("/{workspaceId}/members")
    @Operation(summary = "Invite member", description = "Invite a user to the workspace")
    public ResponseEntity<ApiResponse<WorkspaceMemberResponse>> inviteMember(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID workspaceId,
            @Valid @RequestBody InviteWorkspaceMemberRequest request) {

        WorkspaceMemberResponse response = workspaceService.inviteMember(userPrincipal.getId(), workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Member invited"));
    }

    @PatchMapping("/{workspaceId}/members/{memberId}")
    @Operation(summary = "Update member role", description = "Change a member's role")
    public ResponseEntity<ApiResponse<WorkspaceMemberResponse>> updateMemberRole(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID workspaceId,
            @PathVariable UUID memberId,
            @Valid @RequestBody UpdateMemberRoleRequest request) {

        WorkspaceMemberResponse response = workspaceService.updateMemberRole(
                userPrincipal.getId(), workspaceId, memberId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Member role updated"));
    }

    @DeleteMapping("/{workspaceId}/members/{memberId}")
    @Operation(summary = "Remove member", description = "Remove a member from the workspace")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID workspaceId,
            @PathVariable UUID memberId) {

        workspaceService.removeMember(userPrincipal.getId(), workspaceId, memberId);
        return ResponseEntity.ok(ApiResponse.success("Member removed"));
    }

    @PostMapping("/{workspaceId}/leave")
    @Operation(summary = "Leave workspace", description = "Leave a workspace")
    public ResponseEntity<ApiResponse<Void>> leaveWorkspace(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID workspaceId) {

        workspaceService.leaveWorkspace(userPrincipal.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success("Left workspace"));
    }

    private <T> PagedResponse<T> toPagedResponse(Page<T> page) {
        return PagedResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}

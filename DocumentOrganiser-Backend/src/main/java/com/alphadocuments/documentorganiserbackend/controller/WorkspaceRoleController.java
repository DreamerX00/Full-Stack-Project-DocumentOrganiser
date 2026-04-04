package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.request.AssignRoleRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.CreateCustomRoleRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateCustomRoleRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.AvailablePermissionsResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.CustomRoleResponse;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.entity.WorkspaceMember;
import com.alphadocuments.documentorganiserbackend.exception.ForbiddenException;
import com.alphadocuments.documentorganiserbackend.repository.WorkspaceMemberRepository;
import com.alphadocuments.documentorganiserbackend.service.WorkspaceRoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing workspace custom roles.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/roles")
@RequiredArgsConstructor
@Tag(name = "Workspace Roles", description = "Custom role management for workspaces")
public class WorkspaceRoleController {

    private final WorkspaceRoleService roleService;
    private final WorkspaceMemberRepository memberRepository;

    @GetMapping
    @Operation(summary = "Get all roles for a workspace")
    public ResponseEntity<List<CustomRoleResponse>> getRoles(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal User user) {
        
        requireMembership(workspaceId, user.getId());
        List<CustomRoleResponse> roles = roleService.getRolesByWorkspace(workspaceId);
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/custom")
    @Operation(summary = "Get only custom (non-system) roles")
    public ResponseEntity<List<CustomRoleResponse>> getCustomRoles(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal User user) {
        
        requireMembership(workspaceId, user.getId());
        List<CustomRoleResponse> roles = roleService.getCustomRolesByWorkspace(workspaceId);
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{roleId}")
    @Operation(summary = "Get a specific role by ID")
    public ResponseEntity<CustomRoleResponse> getRole(
            @PathVariable UUID workspaceId,
            @PathVariable UUID roleId,
            @AuthenticationPrincipal User user) {
        
        requireMembership(workspaceId, user.getId());
        CustomRoleResponse role = roleService.getRoleById(workspaceId, roleId);
        return ResponseEntity.ok(role);
    }

    @PostMapping
    @Operation(summary = "Create a new custom role")
    public ResponseEntity<CustomRoleResponse> createRole(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateCustomRoleRequest request,
            @AuthenticationPrincipal User user) {
        
        requirePermission(workspaceId, user.getId(), "role:create");
        CustomRoleResponse role = roleService.createRole(workspaceId, request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(role);
    }

    @PutMapping("/{roleId}")
    @Operation(summary = "Update an existing role")
    public ResponseEntity<CustomRoleResponse> updateRole(
            @PathVariable UUID workspaceId,
            @PathVariable UUID roleId,
            @Valid @RequestBody UpdateCustomRoleRequest request,
            @AuthenticationPrincipal User user) {
        
        requirePermission(workspaceId, user.getId(), "role:update");
        CustomRoleResponse role = roleService.updateRole(workspaceId, roleId, request);
        return ResponseEntity.ok(role);
    }

    @DeleteMapping("/{roleId}")
    @Operation(summary = "Delete a custom role")
    public ResponseEntity<Void> deleteRole(
            @PathVariable UUID workspaceId,
            @PathVariable UUID roleId,
            @AuthenticationPrincipal User user) {
        
        requirePermission(workspaceId, user.getId(), "role:delete");
        roleService.deleteRole(workspaceId, roleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/permissions")
    @Operation(summary = "Get all available permissions for role configuration")
    public ResponseEntity<AvailablePermissionsResponse> getAvailablePermissions(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal User user) {
        
        requireMembership(workspaceId, user.getId());
        AvailablePermissionsResponse permissions = roleService.getAvailablePermissions();
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/default")
    @Operation(summary = "Get the default role for new members")
    public ResponseEntity<CustomRoleResponse> getDefaultRole(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal User user) {
        
        requireMembership(workspaceId, user.getId());
        CustomRoleResponse role = roleService.getDefaultRole(workspaceId);
        return ResponseEntity.ok(role);
    }

    @PostMapping("/{roleId}/set-default")
    @Operation(summary = "Set a role as the default for new members")
    public ResponseEntity<CustomRoleResponse> setDefaultRole(
            @PathVariable UUID workspaceId,
            @PathVariable UUID roleId,
            @AuthenticationPrincipal User user) {
        
        requirePermission(workspaceId, user.getId(), "role:update");
        CustomRoleResponse role = roleService.setDefaultRole(workspaceId, roleId);
        return ResponseEntity.ok(role);
    }

    @PostMapping("/members/{memberId}/assign")
    @Operation(summary = "Assign a role to a workspace member")
    public ResponseEntity<Void> assignRoleToMember(
            @PathVariable UUID workspaceId,
            @PathVariable UUID memberId,
            @Valid @RequestBody AssignRoleRequest request,
            @AuthenticationPrincipal User user) {
        
        requirePermission(workspaceId, user.getId(), "member:update_role");
        roleService.assignRoleToMember(workspaceId, memberId, request.getRoleId());
        return ResponseEntity.ok().build();
    }

    // ==================== Helper methods ====================

    private void requireMembership(UUID workspaceId, UUID userId) {
        if (!memberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new ForbiddenException("You are not a member of this workspace");
        }
    }

    private void requirePermission(UUID workspaceId, UUID userId, String permission) {
        WorkspaceMember member = memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
            .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace"));

        if (!member.hasPermission(permission)) {
            throw new ForbiddenException("You do not have permission: " + permission);
        }
    }
}

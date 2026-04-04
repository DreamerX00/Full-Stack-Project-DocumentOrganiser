package com.alphadocuments.documentorganiserbackend.service.impl;

import com.alphadocuments.documentorganiserbackend.dto.request.CreateCustomRoleRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateCustomRoleRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.AvailablePermissionsResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.CustomRoleResponse;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.entity.Workspace;
import com.alphadocuments.documentorganiserbackend.entity.WorkspaceCustomRole;
import com.alphadocuments.documentorganiserbackend.entity.WorkspaceMember;
import com.alphadocuments.documentorganiserbackend.exception.BadRequestException;
import com.alphadocuments.documentorganiserbackend.exception.ForbiddenException;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.repository.UserRepository;
import com.alphadocuments.documentorganiserbackend.repository.WorkspaceCustomRoleRepository;
import com.alphadocuments.documentorganiserbackend.repository.WorkspaceMemberRepository;
import com.alphadocuments.documentorganiserbackend.repository.WorkspaceRepository;
import com.alphadocuments.documentorganiserbackend.service.WorkspaceRoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of WorkspaceRoleService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkspaceRoleServiceImpl implements WorkspaceRoleService {

    private final WorkspaceCustomRoleRepository roleRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    // Valid permission prefixes
    private static final Set<String> VALID_PERMISSION_PREFIXES = Set.of(
        "workspace", "folder", "document", "member", "role", "tag", "audit", "policy", "share"
    );

    // Valid permission actions per prefix
    private static final Map<String, Set<String>> VALID_ACTIONS = Map.of(
        "workspace", Set.of("read", "manage", "delete", "*"),
        "folder", Set.of("create", "read", "update", "delete", "*"),
        "document", Set.of("create", "read", "update", "delete", "download", "*"),
        "member", Set.of("invite", "remove", "update_role", "*"),
        "role", Set.of("create", "read", "update", "delete", "*"),
        "tag", Set.of("create", "read", "update", "delete", "assign", "*"),
        "audit", Set.of("read", "export", "*"),
        "policy", Set.of("create", "read", "update", "delete", "*"),
        "share", Set.of("create", "manage", "*")
    );

    @Override
    @Transactional(readOnly = true)
    public List<CustomRoleResponse> getRolesByWorkspace(UUID workspaceId) {
        validateWorkspaceExists(workspaceId);
        return roleRepository.findByWorkspaceId(workspaceId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomRoleResponse> getCustomRolesByWorkspace(UUID workspaceId) {
        validateWorkspaceExists(workspaceId);
        return roleRepository.findCustomRolesByWorkspaceId(workspaceId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomRoleResponse getRoleById(UUID workspaceId, UUID roleId) {
        WorkspaceCustomRole role = findRoleOrThrow(workspaceId, roleId);
        return toResponse(role);
    }

    @Override
    @Transactional
    public CustomRoleResponse createRole(UUID workspaceId, CreateCustomRoleRequest request, UUID createdBy) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        // Check for duplicate name
        if (roleRepository.existsByWorkspaceIdAndName(workspaceId, request.getName())) {
            throw new BadRequestException("A role with name '" + request.getName() + "' already exists");
        }

        // Validate permissions
        List<String> validatedPermissions = validatePermissions(request.getPermissions());

        User creator = userRepository.findById(createdBy)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        WorkspaceCustomRole role = WorkspaceCustomRole.builder()
            .workspace(workspace)
            .name(request.getName())
            .description(request.getDescription())
            .isSystemRole(false)
            .isDefaultRole(false)
            .permissions(validatedPermissions)
            .color(request.getColor())
            .priority(request.getPriority() != null ? request.getPriority() : 0)
            .createdBy(creator)
            .build();

        role = roleRepository.save(role);
        log.info("Created custom role '{}' for workspace {}", role.getName(), workspaceId);

        return toResponse(role);
    }

    @Override
    @Transactional
    public CustomRoleResponse updateRole(UUID workspaceId, UUID roleId, UpdateCustomRoleRequest request) {
        WorkspaceCustomRole role = findRoleOrThrow(workspaceId, roleId);

        // System roles have limited updates
        if (Boolean.TRUE.equals(role.getIsSystemRole())) {
            // Only allow changing isDefaultRole for system roles
            if (request.getName() != null || request.getPermissions() != null || request.getDescription() != null) {
                throw new ForbiddenException("System roles cannot be modified. Only default role setting can be changed.");
            }
        }

        // Check for duplicate name
        if (request.getName() != null && !request.getName().equals(role.getName())) {
            if (roleRepository.existsByWorkspaceIdAndNameExcluding(workspaceId, request.getName(), roleId)) {
                throw new BadRequestException("A role with name '" + request.getName() + "' already exists");
            }
            role.setName(request.getName());
        }

        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        if (request.getPermissions() != null) {
            List<String> validatedPermissions = validatePermissions(request.getPermissions());
            role.setPermissions(validatedPermissions);
        }

        if (request.getColor() != null) {
            role.setColor(request.getColor());
        }

        if (request.getPriority() != null) {
            role.setPriority(request.getPriority());
        }

        if (Boolean.TRUE.equals(request.getIsDefaultRole())) {
            // Clear existing default
            clearDefaultRole(workspaceId);
            role.setIsDefaultRole(true);
        } else if (Boolean.FALSE.equals(request.getIsDefaultRole()) && Boolean.TRUE.equals(role.getIsDefaultRole())) {
            role.setIsDefaultRole(false);
        }

        role = roleRepository.save(role);
        log.info("Updated role '{}' in workspace {}", role.getName(), workspaceId);

        return toResponse(role);
    }

    @Override
    @Transactional
    public void deleteRole(UUID workspaceId, UUID roleId) {
        WorkspaceCustomRole role = findRoleOrThrow(workspaceId, roleId);

        if (Boolean.TRUE.equals(role.getIsSystemRole())) {
            throw new ForbiddenException("System roles cannot be deleted");
        }

        // Check if any members are assigned to this role
        long memberCount = memberRepository.countByCustomRoleId(roleId);
        if (memberCount > 0) {
            throw new BadRequestException("Cannot delete role. " + memberCount + " member(s) are assigned to this role. Reassign them first.");
        }

        roleRepository.delete(role);
        log.info("Deleted custom role '{}' from workspace {}", role.getName(), workspaceId);
    }

    @Override
    public AvailablePermissionsResponse getAvailablePermissions() {
        return AvailablePermissionsResponse.standard();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomRoleResponse getDefaultRole(UUID workspaceId) {
        validateWorkspaceExists(workspaceId);
        return roleRepository.findDefaultRoleByWorkspaceId(workspaceId)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("No default role configured for workspace"));
    }

    @Override
    @Transactional
    public CustomRoleResponse setDefaultRole(UUID workspaceId, UUID roleId) {
        WorkspaceCustomRole role = findRoleOrThrow(workspaceId, roleId);

        // Clear existing default
        clearDefaultRole(workspaceId);

        // Set new default
        role.setIsDefaultRole(true);
        role = roleRepository.save(role);

        log.info("Set role '{}' as default for workspace {}", role.getName(), workspaceId);
        return toResponse(role);
    }

    @Override
    @Transactional
    public void assignRoleToMember(UUID workspaceId, UUID memberId, UUID roleId) {
        WorkspaceCustomRole role = findRoleOrThrow(workspaceId, roleId);

        WorkspaceMember member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (!member.getWorkspace().getId().equals(workspaceId)) {
            throw new BadRequestException("Member does not belong to this workspace");
        }

        member.setCustomRole(role);
        memberRepository.save(member);

        log.info("Assigned role '{}' to member {} in workspace {}", role.getName(), memberId, workspaceId);
    }

    @Override
    public List<String> validatePermissions(List<String> permissions) {
        if (permissions == null || permissions.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> validated = new ArrayList<>();
        for (String permission : permissions) {
            if (permission == null || permission.isBlank()) {
                continue;
            }

            String trimmed = permission.trim().toLowerCase();

            // Allow wildcard for all permissions
            if (trimmed.equals("*")) {
                validated.add("*");
                continue;
            }

            // Parse permission: prefix:action
            String[] parts = trimmed.split(":");
            if (parts.length != 2) {
                throw new BadRequestException("Invalid permission format: " + permission + ". Expected format: 'prefix:action'");
            }

            String prefix = parts[0];
            String action = parts[1];

            if (!VALID_PERMISSION_PREFIXES.contains(prefix)) {
                throw new BadRequestException("Invalid permission prefix: " + prefix + ". Valid prefixes: " + VALID_PERMISSION_PREFIXES);
            }

            Set<String> validActions = VALID_ACTIONS.get(prefix);
            if (validActions != null && !validActions.contains(action)) {
                throw new BadRequestException("Invalid action '" + action + "' for permission prefix '" + prefix + "'. Valid actions: " + validActions);
            }

            validated.add(trimmed);
        }

        return validated.stream().distinct().collect(Collectors.toList());
    }

    // ==================== Private helpers ====================

    private void validateWorkspaceExists(UUID workspaceId) {
        if (!workspaceRepository.existsById(workspaceId)) {
            throw new ResourceNotFoundException("Workspace not found");
        }
    }

    private WorkspaceCustomRole findRoleOrThrow(UUID workspaceId, UUID roleId) {
        WorkspaceCustomRole role = roleRepository.findById(roleId)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        if (!role.getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Role not found in workspace");
        }

        return role;
    }

    private void clearDefaultRole(UUID workspaceId) {
        roleRepository.findDefaultRoleByWorkspaceId(workspaceId).ifPresent(defaultRole -> {
            defaultRole.setIsDefaultRole(false);
            roleRepository.save(defaultRole);
        });
    }

    private CustomRoleResponse toResponse(WorkspaceCustomRole role) {
        Long memberCount = memberRepository.countByCustomRoleId(role.getId());

        return CustomRoleResponse.builder()
            .id(role.getId())
            .workspaceId(role.getWorkspace().getId())
            .name(role.getName())
            .description(role.getDescription())
            .isSystemRole(role.getIsSystemRole())
            .isDefaultRole(role.getIsDefaultRole())
            .permissions(role.getPermissions())
            .color(role.getColor())
            .priority(role.getPriority())
            .createdBy(role.getCreatedBy() != null ? role.getCreatedBy().getId() : null)
            .createdByName(role.getCreatedBy() != null ? role.getCreatedBy().getName() : null)
            .createdAt(role.getCreatedAt())
            .updatedAt(role.getUpdatedAt())
            .memberCount(memberCount)
            .build();
    }
}

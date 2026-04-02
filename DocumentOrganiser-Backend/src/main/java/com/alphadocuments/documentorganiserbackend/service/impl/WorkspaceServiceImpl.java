package com.alphadocuments.documentorganiserbackend.service.impl;

import com.alphadocuments.documentorganiserbackend.dto.request.CreateWorkspaceRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.InviteWorkspaceMemberRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateMemberRoleRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateWorkspaceRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.WorkspaceMemberResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.WorkspaceResponse;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.entity.Workspace;
import com.alphadocuments.documentorganiserbackend.entity.WorkspaceMember;
import com.alphadocuments.documentorganiserbackend.entity.enums.NotificationType;
import com.alphadocuments.documentorganiserbackend.entity.enums.WorkspaceRole;
import com.alphadocuments.documentorganiserbackend.exception.ForbiddenException;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.exception.ValidationException;
import com.alphadocuments.documentorganiserbackend.repository.UserRepository;
import com.alphadocuments.documentorganiserbackend.repository.WorkspaceMemberRepository;
import com.alphadocuments.documentorganiserbackend.repository.WorkspaceRepository;
import com.alphadocuments.documentorganiserbackend.service.NotificationService;
import com.alphadocuments.documentorganiserbackend.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Map;
import java.util.UUID;

/**
 * Implementation of WorkspaceService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkspaceServiceImpl implements WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public WorkspaceResponse createWorkspace(UUID userId, CreateWorkspaceRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = generateSlug(request.getName());
        }

        // Ensure unique slug
        String baseSlug = slug;
        int counter = 1;
        while (workspaceRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .avatarUrl(request.getAvatarUrl())
                .owner(user)
                .build();

        workspace = workspaceRepository.save(workspace);

        // Add creator as OWNER member
        WorkspaceMember ownerMember = WorkspaceMember.builder()
                .workspace(workspace)
                .user(user)
                .role(WorkspaceRole.OWNER)
                .build();
        memberRepository.save(ownerMember);

        log.info("Created workspace {} for user {}", workspace.getId(), userId);
        return mapToResponse(workspace, WorkspaceRole.OWNER, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WorkspaceResponse> getMyWorkspaces(UUID userId, Pageable pageable) {
        return workspaceRepository.findByMemberUserId(userId, pageable)
                .map(ws -> {
                    WorkspaceRole role = memberRepository.findByWorkspaceIdAndUserId(ws.getId(), userId)
                            .map(WorkspaceMember::getRole)
                            .orElse(null);
                    return mapToResponse(ws, role, userId);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspace(UUID userId, UUID workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId.toString()));

        WorkspaceMember membership = memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace"));

        return mapToResponse(workspace, membership.getRole(), userId);
    }

    @Override
    @Transactional
    public WorkspaceResponse updateWorkspace(UUID userId, UUID workspaceId, UpdateWorkspaceRequest request) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId.toString()));

        WorkspaceMember membership = memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace"));

        if (membership.getRole() != WorkspaceRole.OWNER && membership.getRole() != WorkspaceRole.ADMIN) {
            throw new ForbiddenException("Only owners and admins can update workspace settings");
        }

        if (request.getName() != null) {
            workspace.setName(request.getName());
        }
        if (request.getDescription() != null) {
            workspace.setDescription(request.getDescription());
        }
        if (request.getAvatarUrl() != null) {
            workspace.setAvatarUrl(request.getAvatarUrl());
        }

        workspace = workspaceRepository.save(workspace);
        log.info("Updated workspace {}", workspaceId);
        return mapToResponse(workspace, membership.getRole(), userId);
    }

    @Override
    @Transactional
    public void deleteWorkspace(UUID userId, UUID workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId.toString()));

        if (!workspace.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("Only the owner can delete the workspace");
        }

        workspaceRepository.delete(workspace);
        log.info("Deleted workspace {}", workspaceId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WorkspaceMemberResponse> getMembers(UUID userId, UUID workspaceId, Pageable pageable) {
        if (!memberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new ForbiddenException("You are not a member of this workspace");
        }

        return memberRepository.findByWorkspaceId(workspaceId, pageable)
                .map(this::mapToMemberResponse);
    }

    @Override
    @Transactional
    public WorkspaceMemberResponse inviteMember(UUID userId, UUID workspaceId, InviteWorkspaceMemberRequest request) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId.toString()));

        WorkspaceMember inviter = memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace"));

        if (inviter.getRole() != WorkspaceRole.OWNER && inviter.getRole() != WorkspaceRole.ADMIN) {
            throw new ForbiddenException("Only owners and admins can invite members");
        }

        // Cannot assign OWNER role
        if (request.getRole() == WorkspaceRole.OWNER) {
            throw new ValidationException("Cannot assign OWNER role to new members");
        }

        User invitee = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getEmail()));

        if (memberRepository.existsByWorkspaceIdAndUserId(workspaceId, invitee.getId())) {
            throw new ValidationException("User is already a member of this workspace");
        }

        WorkspaceMember newMember = WorkspaceMember.builder()
                .workspace(workspace)
                .user(invitee)
                .role(request.getRole())
                .build();
        newMember = memberRepository.save(newMember);

        // Notify the invited user
        notificationService.createNotification(
                invitee.getId(),
                NotificationType.SYSTEM_ANNOUNCEMENT,
                "Workspace invitation",
                "You've been added to workspace \"" + workspace.getName() + "\" as " + request.getRole(),
                "WORKSPACE",
                workspaceId,
                "/dashboard/workspaces/" + workspaceId,
                Map.of("workspaceName", workspace.getName(), "role", request.getRole().toString())
        );

        log.info("Invited user {} to workspace {} as {}", invitee.getId(), workspaceId, request.getRole());
        return mapToMemberResponse(newMember);
    }

    @Override
    @Transactional
    public WorkspaceMemberResponse updateMemberRole(UUID userId, UUID workspaceId, UUID memberId, UpdateMemberRoleRequest request) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId.toString()));

        WorkspaceMember admin = memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace"));

        if (admin.getRole() != WorkspaceRole.OWNER && admin.getRole() != WorkspaceRole.ADMIN) {
            throw new ForbiddenException("Only owners and admins can change member roles");
        }

        WorkspaceMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", memberId.toString()));

        if (!member.getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Member", memberId.toString());
        }

        // Cannot change owner role or demote owner
        if (member.getRole() == WorkspaceRole.OWNER) {
            throw new ForbiddenException("Cannot change the owner's role");
        }

        // Cannot assign OWNER role
        if (request.getRole() == WorkspaceRole.OWNER) {
            throw new ValidationException("Cannot assign OWNER role");
        }

        member.setRole(request.getRole());
        member = memberRepository.save(member);

        log.info("Updated member {} role to {} in workspace {}", memberId, request.getRole(), workspaceId);
        return mapToMemberResponse(member);
    }

    @Override
    @Transactional
    public void removeMember(UUID userId, UUID workspaceId, UUID memberId) {
        WorkspaceMember admin = memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace"));

        if (admin.getRole() != WorkspaceRole.OWNER && admin.getRole() != WorkspaceRole.ADMIN) {
            throw new ForbiddenException("Only owners and admins can remove members");
        }

        WorkspaceMember member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member", memberId.toString()));

        if (!member.getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Member", memberId.toString());
        }

        // Cannot remove owner
        if (member.getRole() == WorkspaceRole.OWNER) {
            throw new ForbiddenException("Cannot remove the workspace owner");
        }

        memberRepository.delete(member);
        log.info("Removed member {} from workspace {}", memberId, workspaceId);
    }

    @Override
    @Transactional
    public void leaveWorkspace(UUID userId, UUID workspaceId) {
        WorkspaceMember member = memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this workspace"));

        if (member.getRole() == WorkspaceRole.OWNER) {
            throw new ValidationException("Owner cannot leave the workspace. Transfer ownership first or delete the workspace.");
        }

        memberRepository.delete(member);
        log.info("User {} left workspace {}", userId, workspaceId);
    }

    private String generateSlug(String name) {
        return Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }

    private WorkspaceResponse mapToResponse(Workspace workspace, WorkspaceRole currentUserRole, UUID userId) {
        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .slug(workspace.getSlug())
                .description(workspace.getDescription())
                .avatarUrl(workspace.getAvatarUrl())
                .ownerId(workspace.getOwner().getId())
                .ownerName(workspace.getOwner().getName())
                .ownerEmail(workspace.getOwner().getEmail())
                .memberCount(memberRepository.countByWorkspaceId(workspace.getId()))
                .currentUserRole(currentUserRole)
                .createdAt(workspace.getCreatedAt())
                .updatedAt(workspace.getUpdatedAt())
                .build();
    }

    private WorkspaceMemberResponse mapToMemberResponse(WorkspaceMember member) {
        return WorkspaceMemberResponse.builder()
                .id(member.getId())
                .userId(member.getUser().getId())
                .name(member.getUser().getName())
                .email(member.getUser().getEmail())
                .profilePicture(member.getUser().getProfilePicture())
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}

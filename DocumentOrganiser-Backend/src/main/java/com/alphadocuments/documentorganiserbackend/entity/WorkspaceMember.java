package com.alphadocuments.documentorganiserbackend.entity;

import com.alphadocuments.documentorganiserbackend.entity.enums.WorkspaceRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Workspace member entity representing a user's membership in a workspace.
 */
@Entity
@Table(name = "workspace_members", indexes = {
    @Index(name = "idx_workspace_members_workspace_id", columnList = "workspace_id"),
    @Index(name = "idx_workspace_members_user_id", columnList = "user_id"),
    @Index(name = "idx_workspace_members_custom_role", columnList = "custom_role_id")
}, uniqueConstraints = {
    @UniqueConstraint(columnNames = {"workspace_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Legacy role enum - kept for backward compatibility.
     * New code should use customRole instead.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private WorkspaceRole role = WorkspaceRole.MEMBER;

    /**
     * Reference to custom role with granular permissions.
     * This is the preferred way to manage permissions.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_role_id")
    private WorkspaceCustomRole customRole;

    @Column(name = "joined_at", nullable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();

    /**
     * Check if member has a specific permission.
     * First checks custom role, then falls back to legacy role.
     */
    public boolean hasPermission(String permission) {
        if (customRole != null) {
            return customRole.hasPermission(permission);
        }
        // Fallback to legacy role behavior
        return switch (role) {
            case OWNER -> true; // Owner has all permissions
            case ADMIN -> !permission.startsWith("workspace:delete");
            case MEMBER -> permission.startsWith("folder:") || permission.startsWith("document:") 
                || permission.equals("workspace:read");
            case VIEWER -> permission.endsWith(":read") || permission.equals("document:download");
        };
    }
}

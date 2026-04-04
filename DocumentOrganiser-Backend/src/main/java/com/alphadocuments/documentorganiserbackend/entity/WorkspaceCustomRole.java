package com.alphadocuments.documentorganiserbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom role entity for workspace-level RBAC.
 * Allows workspaces to define custom roles with granular permissions.
 * System roles (OWNER, ADMIN, MEMBER, VIEWER) are seeded and immutable.
 */
@Entity
@Table(name = "workspace_custom_roles", indexes = {
    @Index(name = "idx_custom_roles_workspace_id", columnList = "workspace_id"),
    @Index(name = "idx_custom_roles_name", columnList = "workspace_id, name")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_workspace_role_name", columnNames = {"workspace_id", "name"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceCustomRole extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_system_role", nullable = false)
    @Builder.Default
    private Boolean isSystemRole = false;

    @Column(name = "is_default_role", nullable = false)
    @Builder.Default
    private Boolean isDefaultRole = false;

    /**
     * List of permission strings this role grants.
     * Example permissions:
     * - workspace:read, workspace:manage, workspace:delete
     * - folder:create, folder:read, folder:update, folder:delete
     * - document:create, document:read, document:update, document:delete, document:download
     * - member:invite, member:remove, member:update_role
     * - role:create, role:update, role:delete
     * - tag:create, tag:update, tag:delete, tag:assign
     * - audit:read, audit:export
     * - policy:create, policy:update, policy:delete
     * - share:create, share:manage
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "permissions", columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private List<String> permissions = new ArrayList<>();

    @Column(name = "color", length = 7)
    private String color;

    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    /**
     * Check if this role has a specific permission.
     */
    public boolean hasPermission(String permission) {
        if (permissions == null) return false;
        
        // Check exact match
        if (permissions.contains(permission)) return true;
        
        // Check wildcard (e.g., "folder:*" matches "folder:create")
        String[] parts = permission.split(":");
        if (parts.length == 2) {
            String wildcardPerm = parts[0] + ":*";
            if (permissions.contains(wildcardPerm)) return true;
        }
        
        // Check super wildcard
        return permissions.contains("*");
    }

    /**
     * Check if this role has any of the given permissions.
     */
    public boolean hasAnyPermission(List<String> requiredPermissions) {
        return requiredPermissions.stream().anyMatch(this::hasPermission);
    }

    /**
     * Check if this role has all of the given permissions.
     */
    public boolean hasAllPermissions(List<String> requiredPermissions) {
        return requiredPermissions.stream().allMatch(this::hasPermission);
    }
}

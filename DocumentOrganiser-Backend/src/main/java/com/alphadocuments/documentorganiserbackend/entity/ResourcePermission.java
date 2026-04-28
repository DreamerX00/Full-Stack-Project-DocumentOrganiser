package com.alphadocuments.documentorganiserbackend.entity;

import com.alphadocuments.documentorganiserbackend.entity.enums.PermissionEffect;
import com.alphadocuments.documentorganiserbackend.entity.enums.PrincipalType;
import com.alphadocuments.documentorganiserbackend.entity.enums.ResourceType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Resource Permission entity for fine-grained access control (ACL).
 * Allows setting permissions on specific resources for users, roles, or groups.
 * 
 * Permission evaluation order:
 * 1. Explicit DENY on resource → DENY
 * 2. Explicit ALLOW on resource → ALLOW
 * 3. Inherited DENY from parent → DENY
 * 4. Inherited ALLOW from parent → ALLOW
 * 5. Role-based permission → ALLOW/DENY
 * 6. Default: DENY
 */
@Entity
@Table(name = "resource_permissions", indexes = {
    @Index(name = "idx_resource_perm_workspace", columnList = "workspace_id"),
    @Index(name = "idx_resource_perm_resource", columnList = "workspace_id, resource_type, resource_id"),
    @Index(name = "idx_resource_perm_principal", columnList = "principal_type, principal_id"),
    @Index(name = "idx_resource_perm_lookup", columnList = "workspace_id, resource_type, resource_id, principal_type, principal_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourcePermission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    /**
     * Type of resource (FOLDER, DOCUMENT, WORKSPACE).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false, length = 50)
    private ResourceType resourceType;

    /**
     * ID of the specific resource.
     */
    @Column(name = "resource_id", nullable = false)
    private UUID resourceId;

    /**
     * Type of principal (USER, ROLE, GROUP).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "principal_type", nullable = false, length = 50)
    private PrincipalType principalType;

    /**
     * ID of the principal (user ID, role ID, or group ID).
     */
    @Column(name = "principal_id", nullable = false)
    private UUID principalId;

    /**
     * The permission being granted or denied.
     * Examples: "read", "write", "delete", "share", "manage"
     */
    @Column(name = "permission", nullable = false, length = 50)
    private String permission;

    /**
     * Whether this permission allows or denies the action.
     * DENY always takes precedence over ALLOW.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "effect", nullable = false, length = 10)
    @Builder.Default
    private PermissionEffect effect = PermissionEffect.ALLOW;

    /**
     * Optional conditions for this permission (e.g., IP restrictions, time-based).
     * Structure: { "ipAddress": ["10.0.0.0/8"], "timeRange": { "start": "09:00", "end": "18:00" } }
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "conditions", columnDefinition = "jsonb")
    private Map<String, Object> conditions;

    /**
     * Whether this permission was inherited from a parent resource.
     */
    @Column(name = "inherited", nullable = false)
    @Builder.Default
    private Boolean inherited = false;

    /**
     * Source resource ID if this permission was inherited.
     */
    @Column(name = "inherited_from")
    private UUID inheritedFrom;

    /**
     * User who created this permission.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    /**
     * Optional expiration time for temporary permissions.
     */
    @Column(name = "expires_at")
    private Instant expiresAt;

    /**
     * Check if this permission has expired.
     */
    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }

    /**
     * Check if this is an ALLOW permission.
     */
    public boolean isAllow() {
        return effect == PermissionEffect.ALLOW;
    }

    /**
     * Check if this is a DENY permission.
     */
    public boolean isDeny() {
        return effect == PermissionEffect.DENY;
    }
}

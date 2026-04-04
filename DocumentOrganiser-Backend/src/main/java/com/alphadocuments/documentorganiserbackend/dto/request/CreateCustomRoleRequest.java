package com.alphadocuments.documentorganiserbackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for creating a custom workspace role.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomRoleRequest {

    @NotBlank(message = "Role name is required")
    @Size(min = 2, max = 100, message = "Role name must be between 2 and 100 characters")
    @Pattern(regexp = "^[A-Z][A-Z0-9_]*$", message = "Role name must start with uppercase letter and contain only uppercase letters, numbers, and underscores")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    /**
     * List of permission strings.
     * Valid permissions:
     * - workspace:read, workspace:manage, workspace:delete
     * - folder:create, folder:read, folder:update, folder:delete
     * - document:create, document:read, document:update, document:delete, document:download
     * - member:invite, member:remove, member:update_role
     * - role:create, role:read, role:update, role:delete
     * - tag:create, tag:read, tag:update, tag:delete, tag:assign
     * - audit:read, audit:export
     * - policy:create, policy:read, policy:update, policy:delete
     * - share:create, share:manage
     * 
     * Wildcards supported: "folder:*", "document:*", etc.
     */
    private List<String> permissions;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex color code (e.g., #FF5733)")
    private String color;

    /**
     * Priority for role display ordering (higher = more important).
     */
    private Integer priority;
}

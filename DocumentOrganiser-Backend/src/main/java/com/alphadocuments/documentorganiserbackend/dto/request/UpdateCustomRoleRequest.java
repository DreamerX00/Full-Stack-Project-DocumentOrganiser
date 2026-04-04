package com.alphadocuments.documentorganiserbackend.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for updating a custom workspace role.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCustomRoleRequest {

    @Size(min = 2, max = 100, message = "Role name must be between 2 and 100 characters")
    @Pattern(regexp = "^[A-Z][A-Z0-9_]*$", message = "Role name must start with uppercase letter and contain only uppercase letters, numbers, and underscores")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    /**
     * List of permission strings. If provided, replaces existing permissions.
     */
    private List<String> permissions;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex color code")
    private String color;

    /**
     * Priority for role display ordering.
     */
    private Integer priority;

    /**
     * Whether this is the default role for new members.
     */
    private Boolean isDefaultRole;
}

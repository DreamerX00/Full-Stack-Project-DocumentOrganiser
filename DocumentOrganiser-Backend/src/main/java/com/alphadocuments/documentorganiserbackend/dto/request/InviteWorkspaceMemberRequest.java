package com.alphadocuments.documentorganiserbackend.dto.request;

import com.alphadocuments.documentorganiserbackend.entity.enums.WorkspaceRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for inviting a member to a workspace.
 */
@Data
public class InviteWorkspaceMemberRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Role is required")
    private WorkspaceRole role;
}

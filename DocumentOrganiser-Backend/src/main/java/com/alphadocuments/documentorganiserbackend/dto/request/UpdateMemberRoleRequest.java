package com.alphadocuments.documentorganiserbackend.dto.request;

import com.alphadocuments.documentorganiserbackend.entity.enums.WorkspaceRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for updating a member's role in a workspace.
 */
@Data
public class UpdateMemberRoleRequest {
    @NotNull(message = "Role is required")
    private WorkspaceRole role;
}

package com.alphadocuments.documentorganiserbackend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for updating a workspace.
 */
@Data
public class UpdateWorkspaceRequest {
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;

    private String avatarUrl;
}

package com.alphadocuments.documentorganiserbackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for creating a folder.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFolderRequest {

    @NotBlank(message = "Folder name is required")
    @Size(min = 1, max = 255, message = "Folder name must be between 1 and 255 characters")
    private String name;

    private UUID parentFolderId;

    private String color;

    private String description;

    /**
     * Optional workspace ID. When provided, the folder will be created
     * within the specified workspace rather than in the user's personal area.
     */
    private UUID workspaceId;
}

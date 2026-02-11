package com.alphadocuments.documentorganiserbackend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a folder.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFolderRequest {

    @Size(min = 1, max = 255, message = "Folder name must be between 1 and 255 characters")
    private String name;

    private String color;

    private String description;
}

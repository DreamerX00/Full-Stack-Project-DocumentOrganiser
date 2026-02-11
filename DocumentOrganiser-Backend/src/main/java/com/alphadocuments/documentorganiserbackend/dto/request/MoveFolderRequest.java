package com.alphadocuments.documentorganiserbackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for moving a folder.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoveFolderRequest {

    @NotNull(message = "Target folder ID is required (use null for root)")
    private UUID targetFolderId;
}

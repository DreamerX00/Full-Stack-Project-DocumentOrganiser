package com.alphadocuments.documentorganiserbackend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for moving a document.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoveDocumentRequest {

    private UUID targetFolderId; // null means root
}

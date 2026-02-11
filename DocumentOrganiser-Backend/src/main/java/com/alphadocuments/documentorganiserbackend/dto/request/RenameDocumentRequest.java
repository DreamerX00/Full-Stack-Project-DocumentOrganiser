package com.alphadocuments.documentorganiserbackend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for renaming a document.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RenameDocumentRequest {

    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    private String name;
}

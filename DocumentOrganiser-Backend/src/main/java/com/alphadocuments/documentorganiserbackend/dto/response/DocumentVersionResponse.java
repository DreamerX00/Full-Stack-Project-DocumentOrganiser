package com.alphadocuments.documentorganiserbackend.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for document version information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentVersionResponse {
    private UUID id;
    private UUID documentId;
    private Integer versionNumber;
    private Long fileSize;
    private String checksum;
    private String changeDescription;
    private String uploadedBy;
    private LocalDateTime createdAt;
}

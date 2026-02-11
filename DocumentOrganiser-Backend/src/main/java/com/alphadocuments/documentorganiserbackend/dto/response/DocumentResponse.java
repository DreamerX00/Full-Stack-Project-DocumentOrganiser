package com.alphadocuments.documentorganiserbackend.dto.response;

import com.alphadocuments.documentorganiserbackend.entity.enums.DocumentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for document information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {

    private UUID id;
    private String name;
    private String originalName;
    private Long fileSize;
    private String fileType;
    private String mimeType;
    private DocumentCategory category;
    private Integer version;
    private Boolean isFavorite;
    private Long downloadCount;
    private UUID folderId;
    private String folderPath;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastAccessedAt;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private String thumbnailUrl;
    private String downloadUrl;
}

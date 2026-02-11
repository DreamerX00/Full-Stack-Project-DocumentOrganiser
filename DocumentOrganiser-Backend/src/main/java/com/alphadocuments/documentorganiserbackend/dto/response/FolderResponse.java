package com.alphadocuments.documentorganiserbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for folder information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FolderResponse {

    private UUID id;
    private String name;
    private String path;
    private String color;
    private String description;
    private Boolean isRoot;
    private UUID parentFolderId;
    private Instant createdAt;
    private Instant updatedAt;

    @Builder.Default
    private List<FolderResponse> subFolders = new ArrayList<>();

    private int documentCount;
    private int subFolderCount;
}

package com.alphadocuments.documentorganiserbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for folder tree structure.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FolderTreeResponse {

    private UUID id;
    private String name;
    private String path;
    private String color;
    private Boolean isRoot;

    @Builder.Default
    private List<FolderTreeResponse> children = new ArrayList<>();

    private int documentCount;
}

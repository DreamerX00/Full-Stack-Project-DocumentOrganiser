package com.alphadocuments.documentorganiserbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for search results.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultResponse {

    private List<DocumentResponse> documents;
    private List<FolderResponse> folders;
    private long totalDocuments;
    private long totalFolders;
    private long totalResults;
}

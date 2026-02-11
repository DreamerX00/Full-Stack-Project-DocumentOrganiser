package com.alphadocuments.documentorganiserbackend.dto.request;

import com.alphadocuments.documentorganiserbackend.entity.enums.DocumentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Request DTO for search and filter operations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {

    private String query;
    private List<String> fileTypes;
    private List<DocumentCategory> categories;
    private List<String> tags;
    private UUID folderId;
    private Instant dateFrom;
    private Instant dateTo;
    private Long sizeMin;
    private Long sizeMax;
    private Boolean favoritesOnly;
    private String sortBy; // name, date, size, type
    private String sortOrder; // asc, desc
}

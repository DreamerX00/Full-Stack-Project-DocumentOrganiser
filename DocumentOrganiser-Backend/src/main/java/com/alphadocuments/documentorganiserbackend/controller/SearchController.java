package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.request.SearchRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.*;
import com.alphadocuments.documentorganiserbackend.entity.enums.DocumentCategory;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.DocumentService;
import com.alphadocuments.documentorganiserbackend.service.FolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for search operations.
 */
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Search and filter APIs")
public class SearchController {

    private final DocumentService documentService;
    private final FolderService folderService;

    @GetMapping
    @Operation(summary = "Search", description = "Search documents and folders")
    public ResponseEntity<ApiResponse<SearchResultResponse>> search(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {

        // Search documents
        Page<DocumentResponse> documents = documentService.searchDocuments(
                userPrincipal.getId(), q, PageRequest.of(0, limit));

        // Search folders
        Page<FolderResponse> folders = folderService.searchFolders(
                userPrincipal.getId(), q, PageRequest.of(0, limit));

        SearchResultResponse result = SearchResultResponse.builder()
                .documents(documents.getContent())
                .folders(folders.getContent())
                .totalDocuments(documents.getTotalElements())
                .totalFolders(folders.getTotalElements())
                .totalResults(documents.getTotalElements() + folders.getTotalElements())
                .build();

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/documents")
    @Operation(summary = "Search documents", description = "Search documents with filters")
    public ResponseEntity<ApiResponse<PagedResponse<DocumentResponse>>> searchDocuments(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) DocumentCategory category,
            @RequestParam(required = false) List<String> types,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<DocumentResponse> page;

        if (q != null && !q.isBlank()) {
            page = documentService.searchDocuments(userPrincipal.getId(), q, pageable);
        } else if (category != null) {
            page = documentService.getDocumentsByCategory(userPrincipal.getId(), category, pageable);
        } else {
            page = documentService.getDocumentsByFolder(userPrincipal.getId(), null, pageable);
        }

        PagedResponse<DocumentResponse> response = PagedResponse.<DocumentResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/folders")
    @Operation(summary = "Search folders", description = "Search folders by name")
    public ResponseEntity<ApiResponse<PagedResponse<FolderResponse>>> searchFolders(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<FolderResponse> page = folderService.searchFolders(userPrincipal.getId(), q, pageable);

        PagedResponse<FolderResponse> response = PagedResponse.<FolderResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Get search suggestions", description = "Get search suggestions based on user's data")
    public ResponseEntity<ApiResponse<List<String>>> getSearchSuggestions(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {

        // Get document names matching the query
        Page<DocumentResponse> documents = documentService.searchDocuments(
                userPrincipal.getId(), q, PageRequest.of(0, limit));

        List<String> suggestions = documents.getContent().stream()
                .map(DocumentResponse::getName)
                .distinct()
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(suggestions));
    }
}

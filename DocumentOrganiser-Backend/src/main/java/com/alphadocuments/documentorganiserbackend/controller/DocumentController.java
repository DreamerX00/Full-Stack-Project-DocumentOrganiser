package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.request.MoveDocumentRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.RenameDocumentRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.DocumentResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.DocumentVersionResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.PagedResponse;
import com.alphadocuments.documentorganiserbackend.entity.enums.DocumentCategory;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for document management endpoints.
 */
@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Document management APIs")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload document",
            description = "Upload a document. On name conflict, the default is to return 409. "
                    + "Pass conflictResolution=replace to overwrite the existing file, "
                    + "or conflictResolution=keepBoth to rename the upload with a numeric suffix.")
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestParam(value = "folderId", required = false) UUID folderId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "conflictResolution", required = false, defaultValue = "error")
                    String conflictResolution) {

        DocumentResponse document = documentService.uploadDocument(
                userPrincipal.getId(), folderId, file, conflictResolution);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(document, "Document uploaded successfully"));
    }

    @GetMapping("/{documentId}")
    @Operation(summary = "Get document", description = "Get document metadata by ID")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocument(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId) {

        DocumentResponse document = documentService.getDocument(userPrincipal.getId(), documentId);
        return ResponseEntity.ok(ApiResponse.success(document));
    }

    @GetMapping("/{documentId}/download")
    @Operation(summary = "Download document", description = "Download a document file")
    public ResponseEntity<Resource> downloadDocument(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId) {

        DocumentResponse document = documentService.getDocument(userPrincipal.getId(), documentId);
        Resource resource = documentService.downloadDocument(userPrincipal.getId(), documentId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + document.getOriginalName() + "\"")
                .body(resource);
    }

    @GetMapping("/{documentId}/preview")
    @Operation(summary = "Get preview URL", description = "Get a pre-signed URL for document preview")
    public ResponseEntity<ApiResponse<String>> getPreviewUrl(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId) {

        String url = documentService.getPreviewUrl(userPrincipal.getId(), documentId);
        return ResponseEntity.ok(ApiResponse.success(url));
    }

    @PutMapping("/{documentId}")
    @Operation(summary = "Rename document", description = "Rename a document")
    public ResponseEntity<ApiResponse<DocumentResponse>> renameDocument(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId,
            @Valid @RequestBody RenameDocumentRequest request) {

        DocumentResponse document = documentService.renameDocument(userPrincipal.getId(), documentId, request);
        return ResponseEntity.ok(ApiResponse.success(document, "Document renamed successfully"));
    }

    @DeleteMapping("/{documentId}")
    @Operation(summary = "Delete document", description = "Delete a document (moves to trash)")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId) {

        documentService.deleteDocument(userPrincipal.getId(), documentId);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully"));
    }

    @PostMapping("/{documentId}/move")
    @Operation(summary = "Move document", description = "Move document to another folder")
    public ResponseEntity<ApiResponse<DocumentResponse>> moveDocument(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId,
            @Valid @RequestBody MoveDocumentRequest request) {

        DocumentResponse document = documentService.moveDocument(userPrincipal.getId(), documentId, request);
        return ResponseEntity.ok(ApiResponse.success(document, "Document moved successfully"));
    }

    @PostMapping("/{documentId}/copy")
    @Operation(summary = "Copy document", description = "Copy document to another folder")
    public ResponseEntity<ApiResponse<DocumentResponse>> copyDocument(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId,
            @RequestParam(value = "targetFolderId", required = false) UUID targetFolderId) {

        DocumentResponse document = documentService.copyDocument(userPrincipal.getId(), documentId, targetFolderId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(document, "Document copied successfully"));
    }

    @PostMapping("/{documentId}/favorite")
    @Operation(summary = "Toggle favorite", description = "Toggle document favorite status")
    public ResponseEntity<ApiResponse<DocumentResponse>> toggleFavorite(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId) {

        DocumentResponse document = documentService.toggleFavorite(userPrincipal.getId(), documentId);
        String message = document.getIsFavorite() ? "Added to favorites" : "Removed from favorites";
        return ResponseEntity.ok(ApiResponse.success(document, message));
    }

    @GetMapping
    @Operation(summary = "Get documents", description = "Get all documents with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<DocumentResponse>>> getDocuments(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestParam(value = "folderId", required = false) UUID folderId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<DocumentResponse> page = documentService.getDocumentsByFolder(userPrincipal.getId(), folderId, pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(page)));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get documents by category", description = "Get documents filtered by category")
    public ResponseEntity<ApiResponse<PagedResponse<DocumentResponse>>> getDocumentsByCategory(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable DocumentCategory category,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<DocumentResponse> page = documentService.getDocumentsByCategory(userPrincipal.getId(), category, pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(page)));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent documents", description = "Get recently accessed documents")
    public ResponseEntity<ApiResponse<PagedResponse<DocumentResponse>>> getRecentDocuments(
            @CurrentUser UserPrincipal userPrincipal,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<DocumentResponse> page = documentService.getRecentDocuments(userPrincipal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(page)));
    }

    @GetMapping("/favorites")
    @Operation(summary = "Get favorite documents", description = "Get all favorite documents")
    public ResponseEntity<ApiResponse<PagedResponse<DocumentResponse>>> getFavoriteDocuments(
            @CurrentUser UserPrincipal userPrincipal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<DocumentResponse> page = documentService.getFavoriteDocuments(userPrincipal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(page)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search documents", description = "Search documents by name")
    public ResponseEntity<ApiResponse<PagedResponse<DocumentResponse>>> searchDocuments(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<DocumentResponse> page = documentService.searchDocuments(userPrincipal.getId(), query, pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(page)));
    }

    @PostMapping("/{documentId}/tags")
    @Operation(summary = "Add tag", description = "Add a tag to a document")
    public ResponseEntity<ApiResponse<Void>> addTag(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId,
            @RequestParam String tag) {

        documentService.addTag(userPrincipal.getId(), documentId, tag);
        return ResponseEntity.ok(ApiResponse.success("Tag added successfully"));
    }

    @DeleteMapping("/{documentId}/tags/{tag}")
    @Operation(summary = "Remove tag", description = "Remove a tag from a document")
    public ResponseEntity<ApiResponse<Void>> removeTag(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId,
            @PathVariable String tag) {

        documentService.removeTag(userPrincipal.getId(), documentId, tag);
        return ResponseEntity.ok(ApiResponse.success("Tag removed successfully"));
    }

    @GetMapping("/tags")
    @Operation(summary = "Get all tags", description = "Get all tags used by the current user")
    public ResponseEntity<ApiResponse<List<String>>> getUserTags(@CurrentUser UserPrincipal userPrincipal) {
        List<String> tags = documentService.getUserTags(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(tags));
    }

    private <T> PagedResponse<T> toPagedResponse(Page<T> page) {
        return PagedResponse.<T>builder()
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
    }

    // ── Version management endpoints ───────────────────────

    @GetMapping("/{documentId}/versions")
    @Operation(summary = "Get version history", description = "Get all versions of a document")
    public ResponseEntity<ApiResponse<List<DocumentVersionResponse>>> getVersions(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId) {

        List<DocumentVersionResponse> versions = documentService.getVersions(userPrincipal.getId(), documentId);
        return ResponseEntity.ok(ApiResponse.success(versions));
    }

    @PostMapping("/{documentId}/versions/{versionNumber}/restore")
    @Operation(summary = "Restore version", description = "Restore a document to a previous version")
    public ResponseEntity<ApiResponse<DocumentResponse>> restoreVersion(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId,
            @PathVariable Integer versionNumber) {

        DocumentResponse document = documentService.restoreVersion(userPrincipal.getId(), documentId, versionNumber);
        return ResponseEntity.ok(ApiResponse.success(document, "Version restored successfully"));
    }
}

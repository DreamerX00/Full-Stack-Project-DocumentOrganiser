package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.request.CreateShareLinkRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.ShareWithUserRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.*;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.SharingService;
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

import java.util.UUID;

/**
 * REST controller for sharing operations.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Sharing", description = "Document and folder sharing APIs")
public class SharingController {

    private final SharingService sharingService;

    // === Document Sharing ===

    @PostMapping("/documents/{documentId}/share")
    @Operation(summary = "Share document", description = "Share a document with another user")
    public ResponseEntity<ApiResponse<SharedItemResponse>> shareDocument(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId,
            @Valid @RequestBody ShareWithUserRequest request) {

        SharedItemResponse response = sharingService.shareDocumentWithUser(
                userPrincipal.getId(), documentId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Document shared successfully"));
    }

    @PostMapping("/documents/{documentId}/share/link")
    @Operation(summary = "Create document share link", description = "Create a public share link for a document")
    public ResponseEntity<ApiResponse<ShareLinkResponse>> createDocumentShareLink(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId,
            @Valid @RequestBody CreateShareLinkRequest request) {

        ShareLinkResponse response = sharingService.createDocumentShareLink(
                userPrincipal.getId(), documentId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Share link created successfully"));
    }

    // === Folder Sharing ===

    @PostMapping("/folders/{folderId}/share")
    @Operation(summary = "Share folder", description = "Share a folder with another user")
    public ResponseEntity<ApiResponse<SharedItemResponse>> shareFolder(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID folderId,
            @Valid @RequestBody ShareWithUserRequest request) {

        SharedItemResponse response = sharingService.shareFolderWithUser(
                userPrincipal.getId(), folderId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Folder shared successfully"));
    }

    @PostMapping("/folders/{folderId}/share/link")
    @Operation(summary = "Create folder share link", description = "Create a public share link for a folder")
    public ResponseEntity<ApiResponse<ShareLinkResponse>> createFolderShareLink(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID folderId,
            @Valid @RequestBody CreateShareLinkRequest request) {

        ShareLinkResponse response = sharingService.createFolderShareLink(
                userPrincipal.getId(), folderId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Share link created successfully"));
    }

    // === Shared With Me ===

    @GetMapping("/documents/shared-with-me")
    @Operation(summary = "Get documents shared with me", description = "Get all documents shared with the current user")
    public ResponseEntity<ApiResponse<PagedResponse<SharedItemResponse>>> getDocumentsSharedWithMe(
            @CurrentUser UserPrincipal userPrincipal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<SharedItemResponse> page = sharingService.getDocumentsSharedWithMe(userPrincipal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(page)));
    }

    @GetMapping("/folders/shared-with-me")
    @Operation(summary = "Get folders shared with me", description = "Get all folders shared with the current user")
    public ResponseEntity<ApiResponse<PagedResponse<SharedItemResponse>>> getFoldersSharedWithMe(
            @CurrentUser UserPrincipal userPrincipal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<SharedItemResponse> page = sharingService.getFoldersSharedWithMe(userPrincipal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(page)));
    }

    // === Shared By Me ===

    @GetMapping("/documents/shared-by-me")
    @Operation(summary = "Get documents shared by me", description = "Get all documents shared by the current user")
    public ResponseEntity<ApiResponse<PagedResponse<SharedItemResponse>>> getDocumentsSharedByMe(
            @CurrentUser UserPrincipal userPrincipal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<SharedItemResponse> page = sharingService.getDocumentsSharedByMe(userPrincipal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(page)));
    }

    @GetMapping("/folders/shared-by-me")
    @Operation(summary = "Get folders shared by me", description = "Get all folders shared by the current user")
    public ResponseEntity<ApiResponse<PagedResponse<SharedItemResponse>>> getFoldersSharedByMe(
            @CurrentUser UserPrincipal userPrincipal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<SharedItemResponse> page = sharingService.getFoldersSharedByMe(userPrincipal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(page)));
    }

    // === Revoke Sharing ===

    @DeleteMapping("/shares/documents/{shareId}")
    @Operation(summary = "Unshare document", description = "Revoke document sharing")
    public ResponseEntity<ApiResponse<Void>> unshareDocument(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID shareId) {

        sharingService.unshareDocument(userPrincipal.getId(), shareId);
        return ResponseEntity.ok(ApiResponse.success("Share revoked successfully"));
    }

    @DeleteMapping("/shares/folders/{shareId}")
    @Operation(summary = "Unshare folder", description = "Revoke folder sharing")
    public ResponseEntity<ApiResponse<Void>> unshareFolder(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID shareId) {

        sharingService.unshareFolder(userPrincipal.getId(), shareId);
        return ResponseEntity.ok(ApiResponse.success("Share revoked successfully"));
    }

    // === Share Links Management ===

    @GetMapping("/shares/links")
    @Operation(summary = "Get my share links", description = "Get all share links created by the current user")
    public ResponseEntity<ApiResponse<PagedResponse<ShareLinkResponse>>> getMyShareLinks(
            @CurrentUser UserPrincipal userPrincipal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ShareLinkResponse> page = sharingService.getMyShareLinks(userPrincipal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(toPagedResponse(page)));
    }

    @DeleteMapping("/shares/links/{shareLinkId}")
    @Operation(summary = "Deactivate share link", description = "Deactivate a share link")
    public ResponseEntity<ApiResponse<Void>> deactivateShareLink(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID shareLinkId) {

        sharingService.deactivateShareLink(userPrincipal.getId(), shareLinkId);
        return ResponseEntity.ok(ApiResponse.success("Share link deactivated"));
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
}

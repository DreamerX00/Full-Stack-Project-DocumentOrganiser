package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.request.CreateFolderRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.MoveFolderRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateFolderRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.FolderResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.FolderTreeResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.PagedResponse;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.FolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for folder management endpoints.
 */
@RestController
@RequestMapping("/folders")
@RequiredArgsConstructor
@Tag(name = "Folders", description = "Folder management APIs")
public class FolderController {

    private final FolderService folderService;

    @PostMapping
    @Operation(summary = "Create folder", description = "Create a new folder")
    public ResponseEntity<ApiResponse<FolderResponse>> createFolder(
            @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody CreateFolderRequest request) {

        FolderResponse folder = folderService.createFolder(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(folder, "Folder created successfully"));
    }

    @GetMapping("/{folderId}")
    @Operation(summary = "Get folder", description = "Get folder details by ID")
    public ResponseEntity<ApiResponse<FolderResponse>> getFolder(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID folderId) {

        FolderResponse folder = folderService.getFolder(userPrincipal.getId(), folderId);
        return ResponseEntity.ok(ApiResponse.success(folder));
    }

    @PutMapping("/{folderId}")
    @Operation(summary = "Update folder", description = "Update folder details")
    public ResponseEntity<ApiResponse<FolderResponse>> updateFolder(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID folderId,
            @Valid @RequestBody UpdateFolderRequest request) {

        FolderResponse folder = folderService.updateFolder(userPrincipal.getId(), folderId, request);
        return ResponseEntity.ok(ApiResponse.success(folder, "Folder updated successfully"));
    }

    @DeleteMapping("/{folderId}")
    @Operation(summary = "Delete folder", description = "Delete a folder (moves to trash)")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID folderId) {

        folderService.deleteFolder(userPrincipal.getId(), folderId);
        return ResponseEntity.ok(ApiResponse.success("Folder deleted successfully"));
    }

    @PostMapping("/{folderId}/move")
    @Operation(summary = "Move folder", description = "Move folder to another location")
    public ResponseEntity<ApiResponse<FolderResponse>> moveFolder(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID folderId,
            @Valid @RequestBody MoveFolderRequest request) {

        FolderResponse folder = folderService.moveFolder(
                userPrincipal.getId(), folderId, request.getTargetFolderId());
        return ResponseEntity.ok(ApiResponse.success(folder, "Folder moved successfully"));
    }

    @GetMapping("/{folderId}/children")
    @Operation(summary = "Get sub-folders", description = "Get all sub-folders of a folder")
    public ResponseEntity<ApiResponse<List<FolderResponse>>> getSubFolders(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID folderId) {

        List<FolderResponse> folders = folderService.getSubFolders(userPrincipal.getId(), folderId);
        return ResponseEntity.ok(ApiResponse.success(folders));
    }

    @GetMapping("/root")
    @Operation(summary = "Get root folders", description = "Get all root-level folders")
    public ResponseEntity<ApiResponse<List<FolderResponse>>> getRootFolders(
            @CurrentUser UserPrincipal userPrincipal) {

        List<FolderResponse> folders = folderService.getRootFolders(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(folders));
    }

    @GetMapping("/tree")
    @Operation(summary = "Get folder tree", description = "Get the complete folder tree structure")
    public ResponseEntity<ApiResponse<FolderTreeResponse>> getFolderTree(
            @CurrentUser UserPrincipal userPrincipal) {

        FolderTreeResponse tree = folderService.getFolderTree(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(tree));
    }

    @GetMapping("/search")
    @Operation(summary = "Search folders", description = "Search folders by name")
    public ResponseEntity<ApiResponse<PagedResponse<FolderResponse>>> searchFolders(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestParam String query,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<FolderResponse> page = folderService.searchFolders(userPrincipal.getId(), query, pageable);

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
}

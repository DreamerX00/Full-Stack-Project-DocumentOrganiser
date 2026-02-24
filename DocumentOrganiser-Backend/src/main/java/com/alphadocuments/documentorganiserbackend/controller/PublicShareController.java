package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.DocumentResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.FolderResponse;
import com.alphadocuments.documentorganiserbackend.service.SharingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for public share link access (no authentication required).
 */
@RestController
@RequestMapping("/share")
@RequiredArgsConstructor
@Tag(name = "Public Share", description = "Public share link access APIs")
public class PublicShareController {

    private final SharingService sharingService;

    @GetMapping("/{token}")
    @Operation(summary = "Get shared document info", description = "Get document information via share link")
    public ResponseEntity<ApiResponse<DocumentResponse>> getSharedDocument(
            @PathVariable String token,
            @RequestParam(required = false) String password) {

        DocumentResponse document = sharingService.getDocumentByShareLink(token, password);
        return ResponseEntity.ok(ApiResponse.success(document));
    }

    @GetMapping("/{token}/download")
    @Operation(summary = "Download shared document", description = "Download document via share link")
    public ResponseEntity<Resource> downloadSharedDocument(
            @PathVariable String token,
            @RequestParam(required = false) String password) {

        // downloadDocumentByShareLink validates the link, returns the file
        // resource, and provides metadata — without incrementing the access
        // count (the GET /{token} metadata endpoint already handles that).
        DocumentResponse metadata = sharingService.getDownloadMetadata(token, password);
        Resource resource = sharingService.downloadDocumentByShareLink(token, password);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + metadata.getOriginalName() + "\"")
                .body(resource);
    }

    @GetMapping("/{token}/type")
    @Operation(summary = "Get share link type", description = "Returns whether a share link points to a DOCUMENT or FOLDER")
    public ResponseEntity<ApiResponse<Map<String, String>>> getShareLinkType(
            @PathVariable String token,
            @RequestParam(required = false) String password) {

        String type = sharingService.getShareLinkType(token, password);
        return ResponseEntity.ok(ApiResponse.success(Map.of("type", type)));
    }

    @GetMapping("/{token}/folder")
    @Operation(summary = "Get shared folder info", description = "Get folder information via share link")
    public ResponseEntity<ApiResponse<FolderResponse>> getSharedFolder(
            @PathVariable String token,
            @RequestParam(required = false) String password) {

        FolderResponse folder = sharingService.getFolderByShareLink(token, password);
        return ResponseEntity.ok(ApiResponse.success(folder));
    }

    @GetMapping("/{token}/folder/documents")
    @Operation(summary = "List folder documents", description = "List documents in a shared folder via share link")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getSharedFolderDocuments(
            @PathVariable String token,
            @RequestParam(required = false) String password) {

        List<DocumentResponse> documents = sharingService.getFolderDocumentsByShareLink(token, password);
        return ResponseEntity.ok(ApiResponse.success(documents));
    }
}

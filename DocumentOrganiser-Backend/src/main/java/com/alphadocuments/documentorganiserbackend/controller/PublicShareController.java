package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.DocumentResponse;
import com.alphadocuments.documentorganiserbackend.service.SharingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

        DocumentResponse document = sharingService.getDocumentByShareLink(token, password);
        Resource resource = sharingService.downloadDocumentByShareLink(token, password);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + document.getOriginalName() + "\"")
                .body(resource);
    }
}

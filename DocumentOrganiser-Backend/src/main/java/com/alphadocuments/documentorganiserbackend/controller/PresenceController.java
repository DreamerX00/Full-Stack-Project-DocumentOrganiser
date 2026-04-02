package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.ViewerSummary;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.PresenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;

/**
 * REST controller for document presence (who is viewing what).
 */
@RestController
@RequestMapping("/documents/{documentId}")
@RequiredArgsConstructor
@Tag(name = "Presence", description = "Real-time document viewing presence APIs")
public class PresenceController {

    private final PresenceService presenceService;

    @GetMapping("/viewers")
    @Operation(summary = "Get viewers", description = "Get all users currently viewing a document")
    public ResponseEntity<ApiResponse<Set<ViewerSummary>>> getViewers(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId) {

        Set<ViewerSummary> viewers = presenceService.getViewers(documentId);
        return ResponseEntity.ok(ApiResponse.success(viewers));
    }

    @PostMapping("/heartbeat")
    @Operation(summary = "Send heartbeat", description = "Heartbeat to indicate user is still viewing the document")
    public ResponseEntity<ApiResponse<Boolean>> heartbeat(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId) {

        boolean isNew = presenceService.heartbeat(documentId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(isNew, isNew ? "Joined document" : "Heartbeat received"));
    }

    @PostMapping("/leave")
    @Operation(summary = "Leave document", description = "Explicitly notify that user stopped viewing the document")
    public ResponseEntity<ApiResponse<Void>> leave(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId) {

        presenceService.leave(documentId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Left document"));
    }
}

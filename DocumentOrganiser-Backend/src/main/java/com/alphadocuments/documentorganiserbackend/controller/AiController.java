package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.entity.Document;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.repository.DocumentRepository;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST controller for AI-powered document features.
 * Provides auto-tagging and summarization based on document metadata.
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "AI Features", description = "AI-powered document analysis APIs")
public class AiController {

    private final DocumentRepository documentRepository;
    private final DocumentService documentService;

    /**
     * Suggests tags for a document based on its file name and file type.
     * This is a rule-based approach that doesn't require an external AI service.
     */
    @PostMapping("/documents/{documentId}/auto-tag")
    @Operation(summary = "Auto-tag document", description = "Automatically suggest and apply tags based on document metadata")
    public ResponseEntity<ApiResponse<List<String>>> autoTag(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId) {

        Document document = documentRepository.findByIdAndUserIdAndIsDeletedFalse(documentId, userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        List<String> suggestedTags = generateTags(document);

        // Apply the tags
        for (String tag : suggestedTags) {
            try {
                documentService.addTag(userPrincipal.getId(), documentId, tag);
            } catch (Exception ignored) {
                // Tag may already exist
            }
        }

        return ResponseEntity.ok(ApiResponse.success(suggestedTags, "Tags suggested and applied"));
    }

    @GetMapping("/documents/{documentId}/suggest-tags")
    @Operation(summary = "Suggest tags", description = "Get AI-suggested tags without applying them")
    public ResponseEntity<ApiResponse<List<String>>> suggestTags(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId) {

        Document document = documentRepository.findByIdAndUserIdAndIsDeletedFalse(documentId, userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        List<String> suggestedTags = generateTags(document);
        return ResponseEntity.ok(ApiResponse.success(suggestedTags));
    }

    @PostMapping("/documents/{documentId}/summarize")
    @Operation(summary = "Summarize document", description = "Generate a brief summary of the document")
    public ResponseEntity<ApiResponse<Map<String, String>>> summarize(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID documentId) {

        Document document = documentRepository.findByIdAndUserIdAndIsDeletedFalse(documentId, userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        String summary = generateSummary(document);
        Map<String, String> result = Map.of(
                "documentId", documentId.toString(),
                "summary", summary
        );

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // ── Rule-based tag generation ─────────────────────────────
    private List<String> generateTags(Document document) {
        Set<String> tags = new LinkedHashSet<>();
        String name = document.getOriginalName().toLowerCase();
        String mimeType = document.getMimeType() != null ? document.getMimeType().toLowerCase() : "";
        String category = document.getCategory() != null ? document.getCategory().name().toLowerCase() : "";

        // Category-based tags
        if (!category.isEmpty()) {
            tags.add(category);
        }

        // File type tags
        if (mimeType.contains("pdf")) tags.add("pdf");
        if (mimeType.contains("image")) tags.add("image");
        if (mimeType.contains("video")) tags.add("video");
        if (mimeType.contains("spreadsheet") || mimeType.contains("excel")) tags.add("spreadsheet");
        if (mimeType.contains("presentation") || mimeType.contains("powerpoint")) tags.add("presentation");
        if (mimeType.contains("word") || mimeType.contains("document")) tags.add("document");
        if (mimeType.contains("text")) tags.add("text");

        // Name-based keyword tags
        Map<String, String> keywordMap = Map.ofEntries(
                Map.entry("invoice", "invoice"),
                Map.entry("receipt", "receipt"),
                Map.entry("report", "report"),
                Map.entry("resume", "resume"),
                Map.entry("cv", "resume"),
                Map.entry("contract", "contract"),
                Map.entry("agreement", "contract"),
                Map.entry("budget", "finance"),
                Map.entry("financial", "finance"),
                Map.entry("tax", "tax"),
                Map.entry("meeting", "meeting"),
                Map.entry("notes", "notes"),
                Map.entry("proposal", "proposal"),
                Map.entry("project", "project"),
                Map.entry("design", "design"),
                Map.entry("screenshot", "screenshot"),
                Map.entry("photo", "photo"),
                Map.entry("scan", "scanned"),
                Map.entry("certificate", "certificate"),
                Map.entry("letter", "letter"),
                Map.entry("memo", "memo")
        );

        for (Map.Entry<String, String> entry : keywordMap.entrySet()) {
            if (name.contains(entry.getKey())) {
                tags.add(entry.getValue());
            }
        }

        // Date detection (common patterns like 2024, Q1, etc.)
        if (name.matches(".*20\\d{2}.*")) tags.add("dated");
        if (name.matches(".*q[1-4].*")) tags.add("quarterly");

        // Size-based tags
        if (document.getFileSize() != null) {
            if (document.getFileSize() > 50 * 1024 * 1024) tags.add("large-file");
        }

        return new ArrayList<>(tags);
    }

    private String generateSummary(Document document) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("'%s' is a %s file",
                document.getOriginalName(),
                document.getCategory() != null ? document.getCategory().name().toLowerCase() : "general"));

        if (document.getFileSize() != null) {
            sb.append(String.format(" (%.1f KB)", document.getFileSize() / 1024.0));
        }

        sb.append(". ");

        if (document.getIsFavorite() != null && document.getIsFavorite()) {
            sb.append("This document is marked as a favorite. ");
        }

        if (document.getDownloadCount() != null && document.getDownloadCount() > 0) {
            sb.append(String.format("It has been downloaded %d time(s). ", document.getDownloadCount()));
        }

        if (document.getFolder() != null) {
            sb.append(String.format("Located in folder '%s'.", document.getFolder().getName()));
        } else {
            sb.append("Located in the root directory.");
        }

        return sb.toString();
    }
}

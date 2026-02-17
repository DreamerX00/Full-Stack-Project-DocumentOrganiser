package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.entity.Document;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.repository.DocumentRepository;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * REST controller for data export endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/export")
@RequiredArgsConstructor
@Tag(name = "Export", description = "Data export and backup APIs")
public class ExportController {

    private final DocumentRepository documentRepository;
    private final StorageService storageService;

    @GetMapping("/documents")
    @Operation(summary = "Export all documents", description = "Download a ZIP archive of all user documents (GDPR export)")
    public ResponseEntity<byte[]> exportAllDocuments(@CurrentUser UserPrincipal userPrincipal) {
        List<Document> documents = documentRepository.findByUserIdAndIsDeletedFalse(userPrincipal.getId());

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ZipOutputStream zos = new ZipOutputStream(baos);

            for (Document doc : documents) {
                try {
                    InputStream input = storageService.downloadFile(doc.getStorageKey());
                    ZipEntry entry = new ZipEntry(doc.getOriginalName());
                    zos.putNextEntry(entry);
                    input.transferTo(zos);
                    zos.closeEntry();
                    input.close();
                } catch (Exception e) {
                    log.warn("Skipping file {} during export: {}", doc.getOriginalName(), e.getMessage());
                }
            }

            zos.finish();
            zos.close();

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"document-export.zip\"")
                    .body(baos.toByteArray());
        } catch (IOException e) {
            log.error("Export failed", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

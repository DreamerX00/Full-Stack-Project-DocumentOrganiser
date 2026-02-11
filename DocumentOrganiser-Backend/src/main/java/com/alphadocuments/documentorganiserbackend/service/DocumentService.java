package com.alphadocuments.documentorganiserbackend.service;

import com.alphadocuments.documentorganiserbackend.dto.request.MoveDocumentRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.RenameDocumentRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.DocumentResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.PagedResponse;
import com.alphadocuments.documentorganiserbackend.entity.enums.DocumentCategory;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for document operations.
 */
public interface DocumentService {

    DocumentResponse uploadDocument(UUID userId, UUID folderId, MultipartFile file);

    DocumentResponse getDocument(UUID userId, UUID documentId);

    Resource downloadDocument(UUID userId, UUID documentId);

    DocumentResponse renameDocument(UUID userId, UUID documentId, RenameDocumentRequest request);

    void deleteDocument(UUID userId, UUID documentId);

    DocumentResponse moveDocument(UUID userId, UUID documentId, MoveDocumentRequest request);

    DocumentResponse copyDocument(UUID userId, UUID documentId, UUID targetFolderId);

    Page<DocumentResponse> getDocumentsByFolder(UUID userId, UUID folderId, Pageable pageable);

    Page<DocumentResponse> getDocumentsByCategory(UUID userId, DocumentCategory category, Pageable pageable);

    Page<DocumentResponse> getRecentDocuments(UUID userId, Pageable pageable);

    Page<DocumentResponse> getFavoriteDocuments(UUID userId, Pageable pageable);

    DocumentResponse toggleFavorite(UUID userId, UUID documentId);

    Page<DocumentResponse> searchDocuments(UUID userId, String query, Pageable pageable);

    void restoreDocument(UUID userId, UUID documentId);

    String getPreviewUrl(UUID userId, UUID documentId);

    void addTag(UUID userId, UUID documentId, String tag);

    void removeTag(UUID userId, UUID documentId, String tag);

    List<String> getUserTags(UUID userId);
}

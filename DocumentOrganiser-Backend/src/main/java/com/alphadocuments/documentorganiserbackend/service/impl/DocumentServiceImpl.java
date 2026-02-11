package com.alphadocuments.documentorganiserbackend.service.impl;

import com.alphadocuments.documentorganiserbackend.dto.request.MoveDocumentRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.RenameDocumentRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.DocumentResponse;
import com.alphadocuments.documentorganiserbackend.entity.Document;
import com.alphadocuments.documentorganiserbackend.entity.DocumentTag;
import com.alphadocuments.documentorganiserbackend.entity.Folder;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.entity.enums.DocumentCategory;
import com.alphadocuments.documentorganiserbackend.exception.*;
import com.alphadocuments.documentorganiserbackend.repository.DocumentRepository;
import com.alphadocuments.documentorganiserbackend.repository.DocumentTagRepository;
import com.alphadocuments.documentorganiserbackend.repository.FolderRepository;
import com.alphadocuments.documentorganiserbackend.repository.UserRepository;
import com.alphadocuments.documentorganiserbackend.service.DocumentService;
import com.alphadocuments.documentorganiserbackend.service.StorageService;
import com.alphadocuments.documentorganiserbackend.service.UserService;
import com.alphadocuments.documentorganiserbackend.util.FileTypeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of DocumentService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final DocumentTagRepository documentTagRepository;
    private final StorageService storageService;
    private final UserService userService;
    private final FileTypeUtil fileTypeUtil;

    @Override
    @Transactional
    public DocumentResponse uploadDocument(UUID userId, UUID folderId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new ValidationException("File is empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        // Check storage quota
        if (!userService.hasEnoughStorage(userId, file.getSize())) {
            throw new StorageQuotaExceededException(
                    userService.getAvailableStorage(userId), file.getSize());
        }

        Folder folder = null;
        if (folderId != null) {
            folder = folderRepository.findByIdAndUserIdAndIsDeletedFalse(folderId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Folder", folderId.toString()));
        }

        try {
            String originalName = file.getOriginalFilename();
            String mimeType = fileTypeUtil.detectMimeType(file);
            String extension = fileTypeUtil.getFileExtension(originalName);
            DocumentCategory category = fileTypeUtil.categorizeDocument(originalName, mimeType);

            // Generate unique storage key
            String storageKey = generateStorageKey(userId, originalName);

            // Calculate checksum
            String checksum = calculateChecksum(file.getInputStream());

            // Upload to storage
            storageService.uploadFile(storageKey, file.getInputStream(), file.getSize(), mimeType);

            // Create document entity
            Document document = Document.builder()
                    .name(fileTypeUtil.getFileNameWithoutExtension(originalName))
                    .originalName(originalName)
                    .fileSize(file.getSize())
                    .fileType(extension)
                    .mimeType(mimeType)
                    .storageKey(storageKey)
                    .category(category)
                    .version(1)
                    .checksum(checksum)
                    .user(user)
                    .folder(folder)
                    .isDeleted(false)
                    .isFavorite(false)
                    .downloadCount(0L)
                    .build();

            document = documentRepository.save(document);

            // Update user storage
            userService.updateStorageUsed(userId, file.getSize());

            log.info("Uploaded document '{}' for user {}", originalName, userId);
            return mapToDocumentResponse(document);

        } catch (IOException e) {
            log.error("Failed to upload document", e);
            throw new FileOperationException("Failed to upload document", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getDocument(UUID userId, UUID documentId) {
        Document document = getDocumentForUser(userId, documentId);
        return mapToDocumentResponse(document);
    }

    @Override
    @Transactional
    public Resource downloadDocument(UUID userId, UUID documentId) {
        Document document = getDocumentForUser(userId, documentId);

        // Update access tracking
        document.setLastAccessedAt(Instant.now());
        document.setDownloadCount(document.getDownloadCount() + 1);
        documentRepository.save(document);

        InputStream inputStream = storageService.downloadFile(document.getStorageKey());
        return new InputStreamResource(inputStream);
    }

    @Override
    @Transactional
    public DocumentResponse renameDocument(UUID userId, UUID documentId, RenameDocumentRequest request) {
        Document document = getDocumentForUser(userId, documentId);

        if (request.getName() != null && !request.getName().isBlank()) {
            document.setName(request.getName());
        }

        document = documentRepository.save(document);
        log.info("Renamed document {} for user {}", documentId, userId);

        return mapToDocumentResponse(document);
    }

    @Override
    @Transactional
    public void deleteDocument(UUID userId, UUID documentId) {
        Document document = getDocumentForUser(userId, documentId);

        // Soft delete
        document.setIsDeleted(true);
        document.setDeletedAt(Instant.now());
        documentRepository.save(document);

        log.info("Deleted document {} for user {}", documentId, userId);
    }

    @Override
    @Transactional
    public DocumentResponse moveDocument(UUID userId, UUID documentId, MoveDocumentRequest request) {
        Document document = getDocumentForUser(userId, documentId);

        Folder targetFolder = null;
        if (request.getTargetFolderId() != null) {
            targetFolder = folderRepository.findByIdAndUserIdAndIsDeletedFalse(request.getTargetFolderId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Target folder", request.getTargetFolderId().toString()));
        }

        // Check for duplicate name in target folder
        if (documentRepository.existsByUserIdAndFolderIdAndNameAndIsDeletedFalse(
                userId, request.getTargetFolderId(), document.getName())) {
            throw new DuplicateResourceException("Document", document.getName());
        }

        document.setFolder(targetFolder);
        document = documentRepository.save(document);

        log.info("Moved document {} to folder {} for user {}", documentId, request.getTargetFolderId(), userId);
        return mapToDocumentResponse(document);
    }

    @Override
    @Transactional
    public DocumentResponse copyDocument(UUID userId, UUID documentId, UUID targetFolderId) {
        Document original = getDocumentForUser(userId, documentId);

        // Check storage quota
        if (!userService.hasEnoughStorage(userId, original.getFileSize())) {
            throw new StorageQuotaExceededException(
                    userService.getAvailableStorage(userId), original.getFileSize());
        }

        Folder targetFolder = null;
        if (targetFolderId != null) {
            targetFolder = folderRepository.findByIdAndUserIdAndIsDeletedFalse(targetFolderId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Target folder", targetFolderId.toString()));
        }

        // Generate new storage key and copy file
        String newStorageKey = generateStorageKey(userId, original.getOriginalName());
        storageService.copyFile(original.getStorageKey(), newStorageKey);

        // Create copy document
        Document copy = Document.builder()
                .name(original.getName() + " - Copy")
                .originalName(original.getOriginalName())
                .fileSize(original.getFileSize())
                .fileType(original.getFileType())
                .mimeType(original.getMimeType())
                .storageKey(newStorageKey)
                .category(original.getCategory())
                .version(1)
                .checksum(original.getChecksum())
                .user(original.getUser())
                .folder(targetFolder)
                .isDeleted(false)
                .isFavorite(false)
                .downloadCount(0L)
                .build();

        copy = documentRepository.save(copy);

        // Update user storage
        userService.updateStorageUsed(userId, original.getFileSize());

        log.info("Copied document {} to {} for user {}", documentId, targetFolderId, userId);
        return mapToDocumentResponse(copy);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DocumentResponse> getDocumentsByFolder(UUID userId, UUID folderId, Pageable pageable) {
        if (folderId == null) {
            // Get documents without folder
            return documentRepository.findByUserIdAndIsDeletedFalse(userId, pageable)
                    .map(this::mapToDocumentResponse);
        }

        return documentRepository.findByUserIdAndIsDeletedFalse(userId, pageable)
                .map(this::mapToDocumentResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DocumentResponse> getDocumentsByCategory(UUID userId, DocumentCategory category, Pageable pageable) {
        return documentRepository.findByUserIdAndCategoryAndIsDeletedFalse(userId, category, pageable)
                .map(this::mapToDocumentResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DocumentResponse> getRecentDocuments(UUID userId, Pageable pageable) {
        return documentRepository.findRecentDocuments(userId, pageable)
                .map(this::mapToDocumentResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DocumentResponse> getFavoriteDocuments(UUID userId, Pageable pageable) {
        return documentRepository.findByUserIdAndIsFavoriteTrueAndIsDeletedFalse(userId, pageable)
                .map(this::mapToDocumentResponse);
    }

    @Override
    @Transactional
    public DocumentResponse toggleFavorite(UUID userId, UUID documentId) {
        Document document = getDocumentForUser(userId, documentId);
        document.setIsFavorite(!document.getIsFavorite());
        document = documentRepository.save(document);

        log.info("Toggled favorite for document {} (now: {})", documentId, document.getIsFavorite());
        return mapToDocumentResponse(document);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DocumentResponse> searchDocuments(UUID userId, String query, Pageable pageable) {
        return documentRepository.searchByName(userId, query, pageable)
                .map(this::mapToDocumentResponse);
    }

    @Override
    @Transactional
    public void restoreDocument(UUID userId, UUID documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId.toString()));

        if (!document.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You don't have permission to restore this document");
        }

        document.setIsDeleted(false);
        document.setDeletedAt(null);
        documentRepository.save(document);

        log.info("Restored document {} for user {}", documentId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public String getPreviewUrl(UUID userId, UUID documentId) {
        Document document = getDocumentForUser(userId, documentId);
        return storageService.generatePresignedDownloadUrl(document.getStorageKey(), Duration.ofHours(1));
    }

    @Override
    @Transactional
    public void addTag(UUID userId, UUID documentId, String tagName) {
        Document document = getDocumentForUser(userId, documentId);

        if (documentTagRepository.findByDocumentIdAndName(documentId, tagName).isEmpty()) {
            DocumentTag tag = DocumentTag.builder()
                    .document(document)
                    .name(tagName.toLowerCase().trim())
                    .build();
            documentTagRepository.save(tag);
            log.info("Added tag '{}' to document {}", tagName, documentId);
        }
    }

    @Override
    @Transactional
    public void removeTag(UUID userId, UUID documentId, String tagName) {
        Document document = getDocumentForUser(userId, documentId);
        documentTagRepository.deleteByDocumentIdAndName(documentId, tagName.toLowerCase().trim());
        log.info("Removed tag '{}' from document {}", tagName, documentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getUserTags(UUID userId) {
        return documentTagRepository.findDistinctTagsByUserId(userId);
    }

    private Document getDocumentForUser(UUID userId, UUID documentId) {
        return documentRepository.findByIdAndUserIdAndIsDeletedFalse(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId.toString()));
    }

    private String generateStorageKey(UUID userId, String originalName) {
        String extension = fileTypeUtil.getFileExtension(originalName);
        String uuid = UUID.randomUUID().toString();
        return String.format("users/%s/documents/%s.%s", userId, uuid, extension);
    }

    private String calculateChecksum(InputStream inputStream) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (Exception e) {
            log.warn("Failed to calculate checksum", e);
            return null;
        }
    }

    private DocumentResponse mapToDocumentResponse(Document document) {
        List<String> tags = document.getTags() != null ?
                document.getTags().stream().map(DocumentTag::getName).collect(Collectors.toList()) :
                List.of();

        String folderPath = document.getFolder() != null ? document.getFolder().getPath() : "/";

        return DocumentResponse.builder()
                .id(document.getId())
                .name(document.getName())
                .originalName(document.getOriginalName())
                .fileSize(document.getFileSize())
                .fileType(document.getFileType())
                .mimeType(document.getMimeType())
                .category(document.getCategory())
                .version(document.getVersion())
                .isFavorite(document.getIsFavorite())
                .downloadCount(document.getDownloadCount())
                .folderId(document.getFolder() != null ? document.getFolder().getId() : null)
                .folderPath(folderPath)
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .lastAccessedAt(document.getLastAccessedAt())
                .tags(tags)
                .build();
    }
}

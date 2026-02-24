package com.alphadocuments.documentorganiserbackend.service.impl;

import com.alphadocuments.documentorganiserbackend.dto.request.CreateShareLinkRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.ShareWithUserRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.DocumentResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.FolderResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.ShareLinkResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.SharedItemResponse;
import com.alphadocuments.documentorganiserbackend.entity.*;
import com.alphadocuments.documentorganiserbackend.entity.enums.NotificationType;
import com.alphadocuments.documentorganiserbackend.exception.ForbiddenException;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.exception.UnauthorizedException;
import com.alphadocuments.documentorganiserbackend.exception.ValidationException;
import com.alphadocuments.documentorganiserbackend.repository.*;
import com.alphadocuments.documentorganiserbackend.service.NotificationService;
import com.alphadocuments.documentorganiserbackend.service.SharingService;
import com.alphadocuments.documentorganiserbackend.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of SharingService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SharingServiceImpl implements SharingService {

    private final SharedDocumentRepository sharedDocumentRepository;
    private final SharedFolderRepository sharedFolderRepository;
    private final ShareLinkRepository shareLinkRepository;
    private final DocumentRepository documentRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    @Transactional
    public SharedItemResponse shareDocumentWithUser(UUID userId, UUID documentId, ShareWithUserRequest request) {
        Document document = documentRepository.findByIdAndUserIdAndIsDeletedFalse(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId.toString()));

        User sharedWith = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getEmail()));

        if (sharedWith.getId().equals(userId)) {
            throw new ValidationException("Cannot share with yourself");
        }

        if (sharedDocumentRepository.existsByDocumentIdAndSharedWithId(documentId, sharedWith.getId())) {
            throw new ValidationException("Document already shared with this user");
        }

        SharedDocument sharedDocument = SharedDocument.builder()
                .document(document)
                .sharedBy(document.getUser())
                .sharedWith(sharedWith)
                .permission(request.getPermission())
                .expiresAt(request.getExpiresAt())
                .message(request.getMessage())
                .build();

        sharedDocument = sharedDocumentRepository.save(sharedDocument);

        // Send notification
        notificationService.createNotification(
                sharedWith.getId(),
                NotificationType.DOCUMENT_SHARED,
                "Document shared with you",
                document.getUser().getName() + " shared \"" + document.getName() + "\" with you",
                "DOCUMENT",
                documentId,
                "/documents/" + documentId,
                Map.of("sharedBy", document.getUser().getEmail())
        );

        log.info("Shared document {} with user {}", documentId, request.getEmail());
        return mapToSharedItemResponse(sharedDocument, "DOCUMENT");
    }

    @Override
    @Transactional
    public void unshareDocument(UUID userId, UUID shareId) {
        SharedDocument sharedDocument = sharedDocumentRepository.findById(shareId)
                .orElseThrow(() -> new ResourceNotFoundException("Share", shareId.toString()));

        if (!sharedDocument.getSharedBy().getId().equals(userId)) {
            throw new ForbiddenException("You can only revoke shares you created");
        }

        sharedDocumentRepository.delete(sharedDocument);
        log.info("Unshared document share {}", shareId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SharedItemResponse> getDocumentsSharedWithMe(UUID userId, Pageable pageable) {
        return sharedDocumentRepository.findBySharedWithId(userId, pageable)
                .map(sd -> mapToSharedItemResponse(sd, "DOCUMENT"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SharedItemResponse> getDocumentsSharedByMe(UUID userId, Pageable pageable) {
        return sharedDocumentRepository.findBySharedById(userId, pageable)
                .map(sd -> mapToSharedItemResponse(sd, "DOCUMENT"));
    }

    @Override
    @Transactional
    public SharedItemResponse shareFolderWithUser(UUID userId, UUID folderId, ShareWithUserRequest request) {
        Folder folder = folderRepository.findByIdAndUserIdAndIsDeletedFalse(folderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", folderId.toString()));

        User sharedWith = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getEmail()));

        if (sharedWith.getId().equals(userId)) {
            throw new ValidationException("Cannot share with yourself");
        }

        if (sharedFolderRepository.existsByFolderIdAndSharedWithId(folderId, sharedWith.getId())) {
            throw new ValidationException("Folder already shared with this user");
        }

        SharedFolder sharedFolder = SharedFolder.builder()
                .folder(folder)
                .sharedBy(folder.getUser())
                .sharedWith(sharedWith)
                .permission(request.getPermission())
                .expiresAt(request.getExpiresAt())
                .message(request.getMessage())
                .build();

        sharedFolder = sharedFolderRepository.save(sharedFolder);

        // Send notification
        notificationService.createNotification(
                sharedWith.getId(),
                NotificationType.FOLDER_SHARED,
                "Folder shared with you",
                folder.getUser().getName() + " shared folder \"" + folder.getName() + "\" with you",
                "FOLDER",
                folderId,
                "/folders/" + folderId,
                Map.of("sharedBy", folder.getUser().getEmail())
        );

        log.info("Shared folder {} with user {}", folderId, request.getEmail());
        return mapToSharedItemResponse(sharedFolder, "FOLDER");
    }

    @Override
    @Transactional
    public void unshareFolder(UUID userId, UUID shareId) {
        SharedFolder sharedFolder = sharedFolderRepository.findById(shareId)
                .orElseThrow(() -> new ResourceNotFoundException("Share", shareId.toString()));

        if (!sharedFolder.getSharedBy().getId().equals(userId)) {
            throw new ForbiddenException("You can only revoke shares you created");
        }

        sharedFolderRepository.delete(sharedFolder);
        log.info("Unshared folder share {}", shareId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SharedItemResponse> getFoldersSharedWithMe(UUID userId, Pageable pageable) {
        return sharedFolderRepository.findBySharedWithId(userId, pageable)
                .map(sf -> mapToSharedItemResponse(sf, "FOLDER"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SharedItemResponse> getFoldersSharedByMe(UUID userId, Pageable pageable) {
        return sharedFolderRepository.findBySharedById(userId, pageable)
                .map(sf -> mapToSharedItemResponse(sf, "FOLDER"));
    }

    @Override
    @Transactional
    public ShareLinkResponse createDocumentShareLink(UUID userId, UUID documentId, CreateShareLinkRequest request) {
        Document document = documentRepository.findByIdAndUserIdAndIsDeletedFalse(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId.toString()));

        String token = UUID.randomUUID().toString().replace("-", "");
        String passwordHash = request.getPassword() != null ?
                passwordEncoder.encode(request.getPassword()) : null;

        ShareLink shareLink = ShareLink.builder()
                .token(token)
                .document(document)
                .createdBy(document.getUser())
                .permission(request.getPermission())
                .expiresAt(request.getExpiresAt())
                .passwordHash(passwordHash)
                .maxAccessCount(request.getMaxAccessCount())
                .isActive(true)
                .accessCount(0L)
                .build();

        shareLink = shareLinkRepository.save(shareLink);

        log.info("Created share link for document {}", documentId);
        return mapToShareLinkResponse(shareLink, "DOCUMENT", document.getName());
    }

    @Override
    @Transactional
    public ShareLinkResponse createFolderShareLink(UUID userId, UUID folderId, CreateShareLinkRequest request) {
        Folder folder = folderRepository.findByIdAndUserIdAndIsDeletedFalse(folderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", folderId.toString()));

        String token = UUID.randomUUID().toString().replace("-", "");
        String passwordHash = request.getPassword() != null ?
                passwordEncoder.encode(request.getPassword()) : null;

        ShareLink shareLink = ShareLink.builder()
                .token(token)
                .folder(folder)
                .createdBy(folder.getUser())
                .permission(request.getPermission())
                .expiresAt(request.getExpiresAt())
                .passwordHash(passwordHash)
                .maxAccessCount(request.getMaxAccessCount())
                .isActive(true)
                .accessCount(0L)
                .build();

        shareLink = shareLinkRepository.save(shareLink);

        log.info("Created share link for folder {}", folderId);
        return mapToShareLinkResponse(shareLink, "FOLDER", folder.getName());
    }

    @Override
    @Transactional
    public void deactivateShareLink(UUID userId, UUID shareLinkId) {
        ShareLink shareLink = shareLinkRepository.findById(shareLinkId)
                .orElseThrow(() -> new ResourceNotFoundException("Share link", shareLinkId.toString()));

        if (!shareLink.getCreatedBy().getId().equals(userId)) {
            throw new ForbiddenException("You can only deactivate links you created");
        }

        shareLink.setIsActive(false);
        shareLinkRepository.save(shareLink);
        log.info("Deactivated share link {}", shareLinkId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ShareLinkResponse> getMyShareLinks(UUID userId, Pageable pageable) {
        return shareLinkRepository.findByCreatedById(userId, pageable)
                .map(sl -> {
                    String itemType = sl.getDocument() != null ? "DOCUMENT" : "FOLDER";
                    String itemName = sl.getDocument() != null ?
                            sl.getDocument().getName() : sl.getFolder().getName();
                    return mapToShareLinkResponse(sl, itemType, itemName);
                });
    }

    @Override
    @Transactional
    public DocumentResponse getDocumentByShareLink(String token, String password) {
        ShareLink shareLink = validateAndGetShareLink(token, password);

        if (shareLink.getDocument() == null) {
            throw new ValidationException("This link is not for a document");
        }

        // Increment access count
        shareLinkRepository.incrementAccessCount(shareLink.getId());

        Document document = shareLink.getDocument();
        return DocumentResponse.builder()
                .id(document.getId())
                .name(document.getName())
                .originalName(document.getOriginalName())
                .fileSize(document.getFileSize())
                .fileType(document.getFileType())
                .mimeType(document.getMimeType())
                .category(document.getCategory())
                .createdAt(document.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getDownloadMetadata(String token, String password) {
        ShareLink shareLink = validateAndGetShareLink(token, password);

        if (shareLink.getDocument() == null) {
            throw new ValidationException("This link is not for a document");
        }

        Document document = shareLink.getDocument();
        return DocumentResponse.builder()
                .id(document.getId())
                .name(document.getName())
                .originalName(document.getOriginalName())
                .fileSize(document.getFileSize())
                .fileType(document.getFileType())
                .mimeType(document.getMimeType())
                .category(document.getCategory())
                .createdAt(document.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public Resource downloadDocumentByShareLink(String token, String password) {
        ShareLink shareLink = validateAndGetShareLink(token, password);

        if (shareLink.getDocument() == null) {
            throw new ValidationException("This link is not for a document");
        }

        // Access count is NOT incremented here — it is already
        // incremented once in getDocumentByShareLink() which the
        // controller calls first.  Counting here as well would
        // cause a double-increment for every download.

        Document document = shareLink.getDocument();
        InputStream inputStream = storageService.downloadFile(document.getStorageKey());
        return new InputStreamResource(inputStream);
    }

    @Override
    @Transactional(readOnly = true)
    public String getShareLinkType(String token, String password) {
        ShareLink shareLink = validateAndGetShareLink(token, password);
        return shareLink.getDocument() != null ? "DOCUMENT" : "FOLDER";
    }

    @Override
    @Transactional
    public FolderResponse getFolderByShareLink(String token, String password) {
        ShareLink shareLink = validateAndGetShareLink(token, password);

        if (shareLink.getFolder() == null) {
            throw new ValidationException("This link is not for a folder");
        }

        // Increment access count
        shareLinkRepository.incrementAccessCount(shareLink.getId());

        Folder folder = shareLink.getFolder();
        return FolderResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .path(folder.getPath())
                .color(folder.getColor())
                .description(folder.getDescription())
                .createdAt(folder.getCreatedAt())
                .documentCount(folder.getDocuments() != null ? (int) folder.getDocuments().stream()
                        .filter(d -> !d.getIsDeleted()).count() : 0)
                .subFolderCount(folder.getSubFolders() != null ? (int) folder.getSubFolders().stream()
                        .filter(sf -> !sf.getIsDeleted()).count() : 0)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getFolderDocumentsByShareLink(String token, String password) {
        ShareLink shareLink = validateAndGetShareLink(token, password);

        if (shareLink.getFolder() == null) {
            throw new ValidationException("This link is not for a folder");
        }

        Folder folder = shareLink.getFolder();
        return folder.getDocuments().stream()
                .filter(d -> !d.getIsDeleted())
                .map(document -> DocumentResponse.builder()
                        .id(document.getId())
                        .name(document.getName())
                        .originalName(document.getOriginalName())
                        .fileSize(document.getFileSize())
                        .fileType(document.getFileType())
                        .mimeType(document.getMimeType())
                        .category(document.getCategory())
                        .createdAt(document.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private ShareLink validateAndGetShareLink(String token, String password) {
        ShareLink shareLink = shareLinkRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Share link", token));

        if (!shareLink.isValid()) {
            throw new UnauthorizedException("This share link is expired or inactive");
        }

        if (shareLink.getPasswordHash() != null) {
            if (password == null || !passwordEncoder.matches(password, shareLink.getPasswordHash())) {
                throw new UnauthorizedException("Invalid password");
            }
        }

        return shareLink;
    }

    private SharedItemResponse mapToSharedItemResponse(SharedDocument sd, String itemType) {
        return SharedItemResponse.builder()
                .id(sd.getId())
                .itemType(itemType)
                .itemId(sd.getDocument().getId())
                .itemName(sd.getDocument().getName())
                .sharedByEmail(sd.getSharedBy().getEmail())
                .sharedByName(sd.getSharedBy().getName())
                .sharedWithEmail(sd.getSharedWith().getEmail())
                .sharedWithName(sd.getSharedWith().getName())
                .permission(sd.getPermission())
                .expiresAt(sd.getExpiresAt())
                .message(sd.getMessage())
                .createdAt(sd.getCreatedAt())
                .isExpired(sd.isExpired())
                .build();
    }

    private SharedItemResponse mapToSharedItemResponse(SharedFolder sf, String itemType) {
        return SharedItemResponse.builder()
                .id(sf.getId())
                .itemType(itemType)
                .itemId(sf.getFolder().getId())
                .itemName(sf.getFolder().getName())
                .sharedByEmail(sf.getSharedBy().getEmail())
                .sharedByName(sf.getSharedBy().getName())
                .sharedWithEmail(sf.getSharedWith().getEmail())
                .sharedWithName(sf.getSharedWith().getName())
                .permission(sf.getPermission())
                .expiresAt(sf.getExpiresAt())
                .message(sf.getMessage())
                .createdAt(sf.getCreatedAt())
                .isExpired(sf.isExpired())
                .build();
    }

    private ShareLinkResponse mapToShareLinkResponse(ShareLink sl, String itemType, String itemName) {
        UUID itemId = sl.getDocument() != null ? sl.getDocument().getId() : sl.getFolder().getId();

        return ShareLinkResponse.builder()
                .id(sl.getId())
                .token(sl.getToken())
                .url(baseUrl + "/share/" + sl.getToken())
                .itemType(itemType)
                .itemId(itemId)
                .itemName(itemName)
                .permission(sl.getPermission())
                .expiresAt(sl.getExpiresAt())
                .hasPassword(sl.getPasswordHash() != null)
                .accessCount(sl.getAccessCount())
                .maxAccessCount(sl.getMaxAccessCount())
                .isActive(sl.getIsActive())
                .createdAt(sl.getCreatedAt())
                .build();
    }
}

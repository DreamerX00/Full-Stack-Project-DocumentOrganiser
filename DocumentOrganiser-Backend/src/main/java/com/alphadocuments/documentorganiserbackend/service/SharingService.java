package com.alphadocuments.documentorganiserbackend.service;

import com.alphadocuments.documentorganiserbackend.dto.request.CreateShareLinkRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.ShareWithUserRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.DocumentResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.ShareLinkResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.SharedItemResponse;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service interface for sharing operations.
 */
public interface SharingService {

    // Document sharing with users
    SharedItemResponse shareDocumentWithUser(UUID userId, UUID documentId, ShareWithUserRequest request);

    void unshareDocument(UUID userId, UUID shareId);

    Page<SharedItemResponse> getDocumentsSharedWithMe(UUID userId, Pageable pageable);

    Page<SharedItemResponse> getDocumentsSharedByMe(UUID userId, Pageable pageable);

    // Folder sharing with users
    SharedItemResponse shareFolderWithUser(UUID userId, UUID folderId, ShareWithUserRequest request);

    void unshareFolder(UUID userId, UUID shareId);

    Page<SharedItemResponse> getFoldersSharedWithMe(UUID userId, Pageable pageable);

    Page<SharedItemResponse> getFoldersSharedByMe(UUID userId, Pageable pageable);

    // Share links
    ShareLinkResponse createDocumentShareLink(UUID userId, UUID documentId, CreateShareLinkRequest request);

    ShareLinkResponse createFolderShareLink(UUID userId, UUID folderId, CreateShareLinkRequest request);

    void deactivateShareLink(UUID userId, UUID shareLinkId);

    Page<ShareLinkResponse> getMyShareLinks(UUID userId, Pageable pageable);

    // Public access via share link
    DocumentResponse getDocumentByShareLink(String token, String password);

    Resource downloadDocumentByShareLink(String token, String password);
}

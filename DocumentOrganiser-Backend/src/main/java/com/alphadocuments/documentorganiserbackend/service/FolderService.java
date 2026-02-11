package com.alphadocuments.documentorganiserbackend.service;

import com.alphadocuments.documentorganiserbackend.dto.request.CreateFolderRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateFolderRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.FolderResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.FolderTreeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for folder operations.
 */
public interface FolderService {

    FolderResponse createFolder(UUID userId, CreateFolderRequest request);

    FolderResponse getFolder(UUID userId, UUID folderId);

    FolderResponse updateFolder(UUID userId, UUID folderId, UpdateFolderRequest request);

    void deleteFolder(UUID userId, UUID folderId);

    FolderResponse moveFolder(UUID userId, UUID folderId, UUID targetFolderId);

    List<FolderResponse> getSubFolders(UUID userId, UUID parentFolderId);

    List<FolderResponse> getRootFolders(UUID userId);

    FolderTreeResponse getFolderTree(UUID userId);

    Page<FolderResponse> searchFolders(UUID userId, String query, Pageable pageable);

    FolderResponse getOrCreateRootFolder(UUID userId);

    void restoreFolder(UUID userId, UUID folderId);
}

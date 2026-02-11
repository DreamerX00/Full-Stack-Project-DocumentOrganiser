package com.alphadocuments.documentorganiserbackend.service.impl;

import com.alphadocuments.documentorganiserbackend.dto.request.CreateFolderRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateFolderRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.FolderResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.FolderTreeResponse;
import com.alphadocuments.documentorganiserbackend.entity.Folder;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.exception.DuplicateResourceException;
import com.alphadocuments.documentorganiserbackend.exception.ForbiddenException;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.exception.ValidationException;
import com.alphadocuments.documentorganiserbackend.repository.FolderRepository;
import com.alphadocuments.documentorganiserbackend.repository.UserRepository;
import com.alphadocuments.documentorganiserbackend.service.FolderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of FolderService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FolderServiceImpl implements FolderService {

    private final FolderRepository folderRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public FolderResponse createFolder(UUID userId, CreateFolderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        Folder parentFolder = null;
        if (request.getParentFolderId() != null) {
            parentFolder = folderRepository.findByIdAndUserIdAndIsDeletedFalse(request.getParentFolderId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent folder", request.getParentFolderId().toString()));
        }

        // Check for duplicate name in same parent
        if (folderRepository.existsByUserIdAndParentFolderIdAndNameAndIsDeletedFalse(
                userId, request.getParentFolderId(), request.getName())) {
            throw new DuplicateResourceException("Folder", request.getName());
        }

        Folder folder = Folder.builder()
                .name(request.getName())
                .color(request.getColor())
                .description(request.getDescription())
                .user(user)
                .parentFolder(parentFolder)
                .isRoot(false)
                .isDeleted(false)
                .build();

        folder.updatePath();
        folder = folderRepository.save(folder);

        log.info("Created folder '{}' for user {}", request.getName(), userId);
        return mapToFolderResponse(folder);
    }

    @Override
    @Transactional(readOnly = true)
    public FolderResponse getFolder(UUID userId, UUID folderId) {
        Folder folder = folderRepository.findByIdAndUserIdAndIsDeletedFalse(folderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", folderId.toString()));

        return mapToFolderResponse(folder);
    }

    @Override
    @Transactional
    public FolderResponse updateFolder(UUID userId, UUID folderId, UpdateFolderRequest request) {
        Folder folder = folderRepository.findByIdAndUserIdAndIsDeletedFalse(folderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", folderId.toString()));

        if (folder.getIsRoot()) {
            throw new ForbiddenException("Cannot modify root folder");
        }

        if (request.getName() != null && !request.getName().equals(folder.getName())) {
            // Check for duplicate name
            UUID parentId = folder.getParentFolder() != null ? folder.getParentFolder().getId() : null;
            if (folderRepository.existsByUserIdAndParentFolderIdAndNameAndIsDeletedFalse(
                    userId, parentId, request.getName())) {
                throw new DuplicateResourceException("Folder", request.getName());
            }
            folder.setName(request.getName());
            folder.updatePath();

            // Update paths of all subfolders
            updateSubfolderPaths(folder);
        }

        if (request.getColor() != null) {
            folder.setColor(request.getColor());
        }
        if (request.getDescription() != null) {
            folder.setDescription(request.getDescription());
        }

        folder = folderRepository.save(folder);
        log.info("Updated folder {} for user {}", folderId, userId);

        return mapToFolderResponse(folder);
    }

    @Override
    @Transactional
    public void deleteFolder(UUID userId, UUID folderId) {
        Folder folder = folderRepository.findByIdAndUserIdAndIsDeletedFalse(folderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", folderId.toString()));

        if (folder.getIsRoot()) {
            throw new ForbiddenException("Cannot delete root folder");
        }

        // Soft delete the folder and all subfolders/documents
        softDeleteFolder(folder);
        log.info("Deleted folder {} for user {}", folderId, userId);
    }

    @Override
    @Transactional
    public FolderResponse moveFolder(UUID userId, UUID folderId, UUID targetFolderId) {
        Folder folder = folderRepository.findByIdAndUserIdAndIsDeletedFalse(folderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", folderId.toString()));

        if (folder.getIsRoot()) {
            throw new ForbiddenException("Cannot move root folder");
        }

        Folder targetFolder = null;
        if (targetFolderId != null) {
            targetFolder = folderRepository.findByIdAndUserIdAndIsDeletedFalse(targetFolderId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Target folder", targetFolderId.toString()));

            // Prevent moving a folder into its own subfolder
            if (isSubfolder(folder, targetFolder)) {
                throw new ValidationException("Cannot move a folder into its own subfolder");
            }
        }

        // Check for duplicate name in target
        if (folderRepository.existsByUserIdAndParentFolderIdAndNameAndIsDeletedFalse(
                userId, targetFolderId, folder.getName())) {
            throw new DuplicateResourceException("Folder", folder.getName());
        }

        folder.setParentFolder(targetFolder);
        folder.updatePath();
        updateSubfolderPaths(folder);

        folder = folderRepository.save(folder);
        log.info("Moved folder {} to {} for user {}", folderId, targetFolderId, userId);

        return mapToFolderResponse(folder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FolderResponse> getSubFolders(UUID userId, UUID parentFolderId) {
        List<Folder> folders = folderRepository.findByUserIdAndParentFolderIdAndIsDeletedFalse(userId, parentFolderId);
        return folders.stream()
                .map(this::mapToFolderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FolderResponse> getRootFolders(UUID userId) {
        List<Folder> folders = folderRepository.findByUserIdAndParentFolderIsNullAndIsDeletedFalse(userId);
        return folders.stream()
                .map(this::mapToFolderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FolderTreeResponse getFolderTree(UUID userId) {
        // Get root folder or create a virtual root
        Folder rootFolder = folderRepository.findByUserIdAndIsRootTrue(userId).orElse(null);

        if (rootFolder != null) {
            return buildFolderTree(rootFolder);
        }

        // Build tree from root-level folders
        List<Folder> rootFolders = folderRepository.findByUserIdAndParentFolderIsNullAndIsDeletedFalse(userId);

        FolderTreeResponse virtualRoot = FolderTreeResponse.builder()
                .id(null)
                .name("My Documents")
                .path("/")
                .isRoot(true)
                .children(rootFolders.stream()
                        .map(this::buildFolderTree)
                        .collect(Collectors.toList()))
                .documentCount(0)
                .build();

        return virtualRoot;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FolderResponse> searchFolders(UUID userId, String query, Pageable pageable) {
        return folderRepository.searchByName(userId, query, pageable)
                .map(this::mapToFolderResponse);
    }

    @Override
    @Transactional
    public FolderResponse getOrCreateRootFolder(UUID userId) {
        return folderRepository.findByUserIdAndIsRootTrue(userId)
                .map(this::mapToFolderResponse)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

                    Folder rootFolder = Folder.builder()
                            .name("My Documents")
                            .path("/My Documents")
                            .user(user)
                            .isRoot(true)
                            .isDeleted(false)
                            .build();

                    rootFolder = folderRepository.save(rootFolder);
                    return mapToFolderResponse(rootFolder);
                });
    }

    @Override
    @Transactional
    public void restoreFolder(UUID userId, UUID folderId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", folderId.toString()));

        if (!folder.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You don't have permission to restore this folder");
        }

        folder.setIsDeleted(false);
        folder.setDeletedAt(null);
        folderRepository.save(folder);

        log.info("Restored folder {} for user {}", folderId, userId);
    }

    private void softDeleteFolder(Folder folder) {
        folder.setIsDeleted(true);
        folder.setDeletedAt(Instant.now());
        folderRepository.save(folder);

        // Recursively soft delete subfolders
        for (Folder subFolder : folder.getSubFolders()) {
            softDeleteFolder(subFolder);
        }
    }

    private void updateSubfolderPaths(Folder parentFolder) {
        for (Folder subFolder : parentFolder.getSubFolders()) {
            subFolder.updatePath();
            folderRepository.save(subFolder);
            updateSubfolderPaths(subFolder);
        }
    }

    private boolean isSubfolder(Folder parent, Folder potentialSubfolder) {
        if (potentialSubfolder == null) return false;
        if (parent.getId().equals(potentialSubfolder.getId())) return true;
        return isSubfolder(parent, potentialSubfolder.getParentFolder());
    }

    private FolderTreeResponse buildFolderTree(Folder folder) {
        List<FolderTreeResponse> children = folder.getSubFolders().stream()
                .filter(f -> !f.getIsDeleted())
                .map(this::buildFolderTree)
                .collect(Collectors.toList());

        return FolderTreeResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .path(folder.getPath())
                .color(folder.getColor())
                .isRoot(folder.getIsRoot())
                .children(children)
                .documentCount(folder.getDocuments() != null ?
                        (int) folder.getDocuments().stream().filter(d -> !d.getIsDeleted()).count() : 0)
                .build();
    }

    private FolderResponse mapToFolderResponse(Folder folder) {
        return FolderResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .path(folder.getPath())
                .color(folder.getColor())
                .description(folder.getDescription())
                .isRoot(folder.getIsRoot())
                .parentFolderId(folder.getParentFolder() != null ? folder.getParentFolder().getId() : null)
                .createdAt(folder.getCreatedAt())
                .updatedAt(folder.getUpdatedAt())
                .documentCount(folder.getDocuments() != null ?
                        (int) folder.getDocuments().stream().filter(d -> !d.getIsDeleted()).count() : 0)
                .subFolderCount(folder.getSubFolders() != null ?
                        (int) folder.getSubFolders().stream().filter(f -> !f.getIsDeleted()).count() : 0)
                .build();
    }
}

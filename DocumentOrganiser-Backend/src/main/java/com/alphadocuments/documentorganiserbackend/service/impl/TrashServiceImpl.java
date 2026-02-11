package com.alphadocuments.documentorganiserbackend.service.impl;

import com.alphadocuments.documentorganiserbackend.dto.response.TrashItemResponse;
import com.alphadocuments.documentorganiserbackend.entity.DeletedItem;
import com.alphadocuments.documentorganiserbackend.entity.Document;
import com.alphadocuments.documentorganiserbackend.entity.Folder;
import com.alphadocuments.documentorganiserbackend.exception.ForbiddenException;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.repository.DeletedItemRepository;
import com.alphadocuments.documentorganiserbackend.repository.DocumentRepository;
import com.alphadocuments.documentorganiserbackend.repository.FolderRepository;
import com.alphadocuments.documentorganiserbackend.service.StorageService;
import com.alphadocuments.documentorganiserbackend.service.TrashService;
import com.alphadocuments.documentorganiserbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

/**
 * Implementation of TrashService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TrashServiceImpl implements TrashService {

    private final DeletedItemRepository deletedItemRepository;
    private final DocumentRepository documentRepository;
    private final FolderRepository folderRepository;
    private final StorageService storageService;
    private final UserService userService;

    private static final int TRASH_RETENTION_DAYS = 30;

    @Override
    @Transactional(readOnly = true)
    public Page<TrashItemResponse> getTrashItems(UUID userId, Pageable pageable) {
        return deletedItemRepository.findByUserIdOrderByDeletedAtDesc(userId, pageable)
                .map(this::mapToTrashItemResponse);
    }

    @Override
    @Transactional
    public void restoreItem(UUID userId, UUID trashItemId) {
        DeletedItem deletedItem = deletedItemRepository.findByIdAndUserId(trashItemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Trash item", trashItemId.toString()));

        if ("DOCUMENT".equals(deletedItem.getItemType())) {
            Document document = documentRepository.findById(deletedItem.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Document", deletedItem.getItemId().toString()));
            document.setIsDeleted(false);
            document.setDeletedAt(null);
            documentRepository.save(document);
        } else if ("FOLDER".equals(deletedItem.getItemType())) {
            Folder folder = folderRepository.findById(deletedItem.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Folder", deletedItem.getItemId().toString()));
            folder.setIsDeleted(false);
            folder.setDeletedAt(null);
            folderRepository.save(folder);
        }

        deletedItemRepository.delete(deletedItem);
        log.info("Restored {} {} for user {}", deletedItem.getItemType(), deletedItem.getItemId(), userId);
    }

    @Override
    @Transactional
    public void permanentlyDelete(UUID userId, UUID trashItemId) {
        DeletedItem deletedItem = deletedItemRepository.findByIdAndUserId(trashItemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Trash item", trashItemId.toString()));

        permanentlyDeleteItem(deletedItem);
        deletedItemRepository.delete(deletedItem);

        log.info("Permanently deleted {} {} for user {}", deletedItem.getItemType(), deletedItem.getItemId(), userId);
    }

    @Override
    @Transactional
    public void emptyTrash(UUID userId) {
        Page<DeletedItem> trashItems = deletedItemRepository.findByUserIdOrderByDeletedAtDesc(
                userId, Pageable.unpaged());

        for (DeletedItem item : trashItems) {
            permanentlyDeleteItem(item);
        }

        deletedItemRepository.deleteAllByUserId(userId);
        log.info("Emptied trash for user {}", userId);
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 3 * * ?") // Run daily at 3 AM
    public void cleanupExpiredItems() {
        log.info("Starting expired trash items cleanup");

        List<DeletedItem> expiredItems = deletedItemRepository.findByExpiresAtBefore(Instant.now());

        for (DeletedItem item : expiredItems) {
            try {
                permanentlyDeleteItem(item);
                deletedItemRepository.delete(item);
                log.info("Cleaned up expired item: {} {}", item.getItemType(), item.getItemId());
            } catch (Exception e) {
                log.error("Failed to cleanup expired item: {} {}", item.getItemType(), item.getItemId(), e);
            }
        }

        log.info("Completed expired trash items cleanup. Processed {} items", expiredItems.size());
    }

    private void permanentlyDeleteItem(DeletedItem deletedItem) {
        if ("DOCUMENT".equals(deletedItem.getItemType())) {
            documentRepository.findById(deletedItem.getItemId()).ifPresent(document -> {
                // Delete from storage
                try {
                    storageService.deleteFile(document.getStorageKey());
                    if (document.getThumbnailKey() != null) {
                        storageService.deleteFile(document.getThumbnailKey());
                    }
                } catch (Exception e) {
                    log.warn("Failed to delete file from storage: {}", document.getStorageKey(), e);
                }

                // Update user storage
                userService.updateStorageUsed(document.getUser().getId(), -document.getFileSize());

                // Delete from database
                documentRepository.delete(document);
            });
        } else if ("FOLDER".equals(deletedItem.getItemType())) {
            folderRepository.findById(deletedItem.getItemId()).ifPresent(folder -> {
                // Permanently delete all documents in folder and subfolders
                deleteAllDocumentsInFolder(folder);
                folderRepository.delete(folder);
            });
        }
    }

    private void deleteAllDocumentsInFolder(Folder folder) {
        // Delete documents in this folder
        for (Document document : folder.getDocuments()) {
            try {
                storageService.deleteFile(document.getStorageKey());
                if (document.getThumbnailKey() != null) {
                    storageService.deleteFile(document.getThumbnailKey());
                }
                userService.updateStorageUsed(document.getUser().getId(), -document.getFileSize());
            } catch (Exception e) {
                log.warn("Failed to delete file: {}", document.getStorageKey(), e);
            }
        }

        // Recursively delete in subfolders
        for (Folder subFolder : folder.getSubFolders()) {
            deleteAllDocumentsInFolder(subFolder);
        }
    }

    private TrashItemResponse mapToTrashItemResponse(DeletedItem item) {
        long daysUntilDeletion = ChronoUnit.DAYS.between(Instant.now(), item.getExpiresAt());

        return TrashItemResponse.builder()
                .id(item.getId())
                .itemType(item.getItemType())
                .itemId(item.getItemId())
                .itemName(item.getItemName())
                .originalPath(item.getOriginalPath())
                .fileSize(item.getFileSize())
                .deletedAt(item.getDeletedAt())
                .expiresAt(item.getExpiresAt())
                .daysUntilPermanentDeletion(Math.max(0, daysUntilDeletion))
                .build();
    }
}

package com.alphadocuments.documentorganiserbackend.service;

import com.alphadocuments.documentorganiserbackend.dto.response.TrashItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service interface for trash operations.
 */
public interface TrashService {

    Page<TrashItemResponse> getTrashItems(UUID userId, Pageable pageable);

    void restoreItem(UUID userId, UUID trashItemId);

    void permanentlyDelete(UUID userId, UUID trashItemId);

    void emptyTrash(UUID userId);

    void cleanupExpiredItems();
}

package com.alphadocuments.documentorganiserbackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Deleted item entity for trash/recycle bin functionality.
 */
@Entity
@Table(name = "deleted_items", indexes = {
    @Index(name = "idx_deleted_items_user_id", columnList = "user_id"),
    @Index(name = "idx_deleted_items_expires_at", columnList = "expires_at"),
    @Index(name = "idx_deleted_items_item", columnList = "item_type, item_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeletedItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "item_type", nullable = false)
    private String itemType; // DOCUMENT or FOLDER

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "original_path")
    private String originalPath;

    @Column(name = "parent_folder_id")
    private UUID parentFolderId;

    @Column(name = "deleted_at", nullable = false)
    private Instant deletedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt; // When to permanently delete (30 days default)

    @Column(name = "file_size")
    private Long fileSize; // For documents only

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}

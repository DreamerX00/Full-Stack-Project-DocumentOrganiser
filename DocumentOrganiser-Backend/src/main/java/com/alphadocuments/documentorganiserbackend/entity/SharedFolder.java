package com.alphadocuments.documentorganiserbackend.entity;

import com.alphadocuments.documentorganiserbackend.entity.enums.SharePermission;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Shared folder entity for user-to-user folder sharing.
 */
@Entity
@Table(name = "shared_folders", indexes = {
    @Index(name = "idx_shared_folders_folder_id", columnList = "folder_id"),
    @Index(name = "idx_shared_folders_shared_by", columnList = "shared_by_user_id"),
    @Index(name = "idx_shared_folders_shared_with", columnList = "shared_with_user_id")
}, uniqueConstraints = {
    @UniqueConstraint(columnNames = {"folder_id", "shared_with_user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedFolder extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id", nullable = false)
    private Folder folder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_by_user_id", nullable = false)
    private User sharedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_with_user_id", nullable = false)
    private User sharedWith;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission", nullable = false)
    private SharePermission permission;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "message")
    private String message;

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }
}

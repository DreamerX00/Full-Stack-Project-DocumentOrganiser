package com.alphadocuments.documentorganiserbackend.entity;

import com.alphadocuments.documentorganiserbackend.entity.enums.SharePermission;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Share link entity for public sharing via link.
 */
@Entity
@Table(name = "share_links", indexes = {
    @Index(name = "idx_share_links_token", columnList = "token"),
    @Index(name = "idx_share_links_document_id", columnList = "document_id"),
    @Index(name = "idx_share_links_folder_id", columnList = "folder_id"),
    @Index(name = "idx_share_links_created_by", columnList = "created_by_user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareLink extends BaseEntity {

    @Column(name = "token", nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission", nullable = false)
    private SharePermission permission;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "password_hash")
    private String passwordHash; // Optional password protection

    @Column(name = "access_count")
    @Builder.Default
    private Long accessCount = 0L;

    @Column(name = "max_access_count")
    private Long maxAccessCount; // Optional limit on number of accesses

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }

    public boolean isMaxAccessReached() {
        return maxAccessCount != null && accessCount >= maxAccessCount;
    }

    public boolean isValid() {
        return isActive && !isExpired() && !isMaxAccessReached();
    }

    public void incrementAccessCount() {
        this.accessCount++;
    }
}

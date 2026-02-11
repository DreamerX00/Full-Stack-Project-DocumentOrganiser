package com.alphadocuments.documentorganiserbackend.entity;

import com.alphadocuments.documentorganiserbackend.entity.enums.SharePermission;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Shared document entity for user-to-user document sharing.
 */
@Entity
@Table(name = "shared_documents", indexes = {
    @Index(name = "idx_shared_documents_document_id", columnList = "document_id"),
    @Index(name = "idx_shared_documents_shared_by", columnList = "shared_by_user_id"),
    @Index(name = "idx_shared_documents_shared_with", columnList = "shared_with_user_id")
}, uniqueConstraints = {
    @UniqueConstraint(columnNames = {"document_id", "shared_with_user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

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
    private String message; // Optional message when sharing

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }
}

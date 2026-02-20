package com.alphadocuments.documentorganiserbackend.entity;

import com.alphadocuments.documentorganiserbackend.entity.enums.DocumentCategory;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * Document entity representing a file/document in the system.
 */
@Entity
@Table(name = "documents", indexes = {
    @Index(name = "idx_documents_user_id", columnList = "user_id"),
    @Index(name = "idx_documents_folder_id", columnList = "folder_id"),
    @Index(name = "idx_documents_category", columnList = "category"),
    @Index(name = "idx_documents_deleted", columnList = "is_deleted"),
    @Index(name = "idx_documents_name", columnList = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "file_size", nullable = false)
    private Long fileSize; // Size in bytes

    @Column(name = "file_type")
    private String fileType; // File extension (pdf, docx, etc.)

    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Column(name = "storage_key", nullable = false, unique = true)
    private String storageKey; // Key/path in S3/MinIO

    @Column(name = "thumbnail_key")
    private String thumbnailKey; // Key for thumbnail in storage

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private DocumentCategory category;

    @Column(name = "version")
    @Builder.Default
    private Integer version = 1;

    @Column(name = "checksum")
    private String checksum; // MD5/SHA256 hash for integrity

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "is_favorite")
    @Builder.Default
    private Boolean isFavorite = false;

    @Column(name = "last_accessed_at")
    private Instant lastAccessedAt;

    @Column(name = "download_count")
    @Builder.Default
    private Long downloadCount = 0L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<DocumentVersion> versions = new HashSet<>();

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<DocumentTag> tags = new HashSet<>();

    @OneToOne(mappedBy = "document", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private DocumentMetadata metadata;
}

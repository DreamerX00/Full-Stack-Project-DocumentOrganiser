package com.alphadocuments.documentorganiserbackend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Document version entity for tracking version history.
 */
@Entity
@Table(name = "document_versions", indexes = {
    @Index(name = "idx_document_versions_document_id", columnList = "document_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentVersion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "checksum")
    private String checksum;

    @Column(name = "change_description")
    private String changeDescription;

    @Column(name = "uploaded_by")
    private String uploadedBy; // User email or name
}

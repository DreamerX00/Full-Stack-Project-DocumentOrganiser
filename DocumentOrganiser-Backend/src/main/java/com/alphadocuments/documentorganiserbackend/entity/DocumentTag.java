package com.alphadocuments.documentorganiserbackend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Document tag entity for tagging documents.
 */
@Entity
@Table(name = "document_tags", indexes = {
    @Index(name = "idx_document_tags_document_id", columnList = "document_id"),
    @Index(name = "idx_document_tags_name", columnList = "name")
}, uniqueConstraints = {
    @UniqueConstraint(columnNames = {"document_id", "name"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentTag extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "color")
    private String color; // Hex color code for tag
}

package com.alphadocuments.documentorganiserbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;

/**
 * Document metadata entity for storing extended metadata as JSON.
 */
@Entity
@Table(name = "document_metadata")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentMetadata extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false, unique = true)
    private Document document;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    @Column(name = "extracted_text", columnDefinition = "TEXT")
    private String extractedText; // For full-text search

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(name = "width")
    private Integer width; // For images/videos

    @Column(name = "height")
    private Integer height; // For images/videos

    @Column(name = "duration_seconds")
    private Long durationSeconds; // For audio/video

    @Column(name = "author")
    private String author;

    @Column(name = "title")
    private String title;
}

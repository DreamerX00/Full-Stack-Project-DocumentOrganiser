package com.alphadocuments.documentorganiserbackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Shared rate-limit state for multi-instance deployments.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rate_limit_buckets")
public class RateLimitBucket {

    @Id
    @Column(name = "bucket_key", nullable = false, length = 255)
    private String bucketKey;

    @Column(name = "window_start", nullable = false)
    private long windowStart;

    @Column(name = "request_count", nullable = false)
    private int requestCount;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "entity_version", nullable = false)
    private long version;
}

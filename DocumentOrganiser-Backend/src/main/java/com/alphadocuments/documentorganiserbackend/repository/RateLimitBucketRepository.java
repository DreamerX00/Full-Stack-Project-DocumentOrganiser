package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.RateLimitBucket;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface RateLimitBucketRepository extends JpaRepository<RateLimitBucket, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select bucket from RateLimitBucket bucket where bucket.bucketKey = :bucketKey")
    Optional<RateLimitBucket> findByBucketKeyForUpdate(@Param("bucketKey") String bucketKey);

    void deleteByUpdatedAtBefore(Instant cutoff);
}

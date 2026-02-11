package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.ActivityLog;
import com.alphadocuments.documentorganiserbackend.entity.enums.ActivityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Repository for ActivityLog entity.
 */
@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {

    Page<ActivityLog> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<ActivityLog> findByUserIdAndActivityTypeOrderByCreatedAtDesc(UUID userId, ActivityType activityType, Pageable pageable);

    List<ActivityLog> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(UUID userId, Instant from, Instant to);

    Page<ActivityLog> findByResourceTypeAndResourceIdOrderByCreatedAtDesc(String resourceType, UUID resourceId, Pageable pageable);
}

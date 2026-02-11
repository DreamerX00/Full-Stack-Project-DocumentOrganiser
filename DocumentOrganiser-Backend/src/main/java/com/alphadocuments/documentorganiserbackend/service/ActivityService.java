package com.alphadocuments.documentorganiserbackend.service;

import com.alphadocuments.documentorganiserbackend.dto.response.ActivityResponse;
import com.alphadocuments.documentorganiserbackend.entity.enums.ActivityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;
import java.util.UUID;

/**
 * Service interface for activity logging operations.
 */
public interface ActivityService {

    void logActivity(UUID userId, ActivityType type, String resourceType, UUID resourceId,
                    String resourceName, String description, Map<String, Object> metadata,
                    String ipAddress, String userAgent);

    Page<ActivityResponse> getActivities(UUID userId, Pageable pageable);

    Page<ActivityResponse> getActivitiesByType(UUID userId, ActivityType type, Pageable pageable);

    Page<ActivityResponse> getActivitiesForResource(String resourceType, UUID resourceId, Pageable pageable);
}

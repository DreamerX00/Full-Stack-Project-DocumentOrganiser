package com.alphadocuments.documentorganiserbackend.service.impl;

import com.alphadocuments.documentorganiserbackend.dto.response.ActivityResponse;
import com.alphadocuments.documentorganiserbackend.entity.ActivityLog;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.entity.enums.ActivityType;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.repository.ActivityLogRepository;
import com.alphadocuments.documentorganiserbackend.repository.UserRepository;
import com.alphadocuments.documentorganiserbackend.service.ActivityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Implementation of ActivityService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @Override
    @Async
    @Transactional
    public void logActivity(UUID userId, ActivityType type, String resourceType, UUID resourceId,
                           String resourceName, String description, Map<String, Object> metadata,
                           String ipAddress, String userAgent) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

            ActivityLog activityLog = ActivityLog.builder()
                    .user(user)
                    .activityType(type)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .resourceName(resourceName)
                    .description(description)
                    .metadata(metadata != null ? metadata : Map.of())
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build();

            activityLogRepository.save(activityLog);
            log.debug("Logged activity {} for user {}", type, userId);
        } catch (Exception e) {
            log.error("Failed to log activity {} for user {}", type, userId, e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityResponse> getActivities(UUID userId, Pageable pageable) {
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToActivityResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityResponse> getActivitiesByType(UUID userId, ActivityType type, Pageable pageable) {
        return activityLogRepository.findByUserIdAndActivityTypeOrderByCreatedAtDesc(userId, type, pageable)
                .map(this::mapToActivityResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityResponse> getActivitiesForResource(String resourceType, UUID resourceId, Pageable pageable) {
        return activityLogRepository.findByResourceTypeAndResourceIdOrderByCreatedAtDesc(resourceType, resourceId, pageable)
                .map(this::mapToActivityResponse);
    }

    private ActivityResponse mapToActivityResponse(ActivityLog activityLog) {
        return ActivityResponse.builder()
                .id(activityLog.getId())
                .activityType(activityLog.getActivityType())
                .resourceType(activityLog.getResourceType())
                .resourceId(activityLog.getResourceId())
                .resourceName(activityLog.getResourceName())
                .description(activityLog.getDescription())
                .metadata(activityLog.getMetadata())
                .createdAt(activityLog.getCreatedAt())
                .build();
    }
}

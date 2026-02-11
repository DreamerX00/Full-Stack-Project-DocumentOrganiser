package com.alphadocuments.documentorganiserbackend.dto.response;

import com.alphadocuments.documentorganiserbackend.entity.enums.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Response DTO for activity log entries.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {

    private UUID id;
    private ActivityType activityType;
    private String resourceType;
    private UUID resourceId;
    private String resourceName;
    private String description;
    private Map<String, Object> metadata;
    private Instant createdAt;
}

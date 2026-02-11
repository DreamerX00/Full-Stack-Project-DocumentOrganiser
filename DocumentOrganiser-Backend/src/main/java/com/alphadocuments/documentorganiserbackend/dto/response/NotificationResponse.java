package com.alphadocuments.documentorganiserbackend.dto.response;

import com.alphadocuments.documentorganiserbackend.entity.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Response DTO for notification.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private UUID id;
    private NotificationType notificationType;
    private String title;
    private String message;
    private Boolean isRead;
    private String resourceType;
    private UUID resourceId;
    private String actionUrl;
    private Map<String, Object> metadata;
    private Instant createdAt;
}

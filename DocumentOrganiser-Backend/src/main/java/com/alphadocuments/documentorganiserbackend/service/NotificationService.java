package com.alphadocuments.documentorganiserbackend.service;

import com.alphadocuments.documentorganiserbackend.dto.response.NotificationResponse;
import com.alphadocuments.documentorganiserbackend.entity.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;
import java.util.UUID;

/**
 * Service interface for notification operations.
 */
public interface NotificationService {

    void createNotification(UUID userId, NotificationType type, String title, String message,
                           String resourceType, UUID resourceId, String actionUrl, Map<String, Object> metadata);

    Page<NotificationResponse> getNotifications(UUID userId, Pageable pageable);

    Page<NotificationResponse> getUnreadNotifications(UUID userId, Pageable pageable);

    long getUnreadCount(UUID userId);

    void markAsRead(UUID userId, UUID notificationId);

    void markAllAsRead(UUID userId);

    void deleteNotification(UUID userId, UUID notificationId);
}

package com.alphadocuments.documentorganiserbackend.service.impl;

import com.alphadocuments.documentorganiserbackend.dto.response.NotificationResponse;
import com.alphadocuments.documentorganiserbackend.entity.Notification;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.entity.enums.NotificationType;
import com.alphadocuments.documentorganiserbackend.exception.ForbiddenException;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.repository.NotificationRepository;
import com.alphadocuments.documentorganiserbackend.repository.UserRepository;
import com.alphadocuments.documentorganiserbackend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Implementation of NotificationService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void createNotification(UUID userId, NotificationType type, String title, String message,
                                   String resourceType, UUID resourceId, String actionUrl,
                                   Map<String, Object> metadata) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        Notification notification = Notification.builder()
                .user(user)
                .notificationType(type)
                .title(title)
                .message(message)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .actionUrl(actionUrl)
                .metadata(metadata != null ? metadata : Map.of())
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("Created notification for user {}: {}", userId, title);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToNotificationResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUnreadNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToNotificationResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        notificationRepository.markAsRead(notificationId, userId);
        log.info("Marked notification {} as read for user {}", notificationId, userId);
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
        log.info("Marked all notifications as read for user {}", userId);
    }

    @Override
    @Transactional
    public void deleteNotification(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId.toString()));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You don't have permission to delete this notification");
        }

        notificationRepository.delete(notification);
        log.info("Deleted notification {} for user {}", notificationId, userId);
    }

    private NotificationResponse mapToNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .notificationType(notification.getNotificationType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .resourceType(notification.getResourceType())
                .resourceId(notification.getResourceId())
                .actionUrl(notification.getActionUrl())
                .metadata(notification.getMetadata())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}

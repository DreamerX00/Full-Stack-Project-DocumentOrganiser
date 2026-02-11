package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.NotificationResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.PagedResponse;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for notification endpoints.
 */
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management APIs")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get notifications", description = "Get all notifications for the current user")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationResponse>>> getNotifications(
            @CurrentUser UserPrincipal userPrincipal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<NotificationResponse> page = notificationService.getNotifications(userPrincipal.getId(), pageable);

        PagedResponse<NotificationResponse> response = PagedResponse.<NotificationResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications", description = "Get all unread notifications")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationResponse>>> getUnreadNotifications(
            @CurrentUser UserPrincipal userPrincipal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<NotificationResponse> page = notificationService.getUnreadNotifications(userPrincipal.getId(), pageable);

        PagedResponse<NotificationResponse> response = PagedResponse.<NotificationResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/unread/count")
    @Operation(summary = "Get unread count", description = "Get the number of unread notifications")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@CurrentUser UserPrincipal userPrincipal) {
        long count = notificationService.getUnreadCount(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Mark as read", description = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID notificationId) {

        notificationService.markAsRead(userPrincipal.getId(), notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@CurrentUser UserPrincipal userPrincipal) {
        notificationService.markAllAsRead(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }

    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Delete notification", description = "Delete a notification")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID notificationId) {

        notificationService.deleteNotification(userPrincipal.getId(), notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted"));
    }
}

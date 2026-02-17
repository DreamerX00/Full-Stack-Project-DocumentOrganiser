package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Server-Sent Events controller for real-time notifications.
 */
@Slf4j
@RestController
@RequestMapping("/notifications/stream")
@RequiredArgsConstructor
@Tag(name = "NotificationStream", description = "Real-time notification streaming via SSE")
public class NotificationSseController {

    private final NotificationService notificationService;
    private final Map<UUID, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to notifications", description = "SSE stream for real-time notification updates")
    public SseEmitter subscribe(@CurrentUser UserPrincipal userPrincipal) {
        UUID userId = userPrincipal.getId();

        // Timeout after 30 minutes; the client will auto-reconnect
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        // Remove on completion/timeout/error
        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError(e -> emitters.remove(userId));

        emitters.put(userId, emitter);

        // Send initial unread count immediately
        try {
            long count = notificationService.getUnreadCount(userId);
            emitter.send(SseEmitter.event()
                    .name("unread-count")
                    .data(count));
        } catch (IOException e) {
            log.warn("Failed to send initial SSE event for user {}", userId);
        }

        // Schedule heartbeat every 15 seconds to keep the connection alive
        scheduler.scheduleAtFixedRate(() -> {
            SseEmitter active = emitters.get(userId);
            if (active != null) {
                try {
                    long count = notificationService.getUnreadCount(userId);
                    active.send(SseEmitter.event()
                            .name("unread-count")
                            .data(count));
                } catch (Exception e) {
                    emitters.remove(userId);
                }
            }
        }, 15, 15, TimeUnit.SECONDS);

        return emitter;
    }

    /**
     * Push a notification event to a specific user if they're connected.
     */
    public void pushToUser(UUID userId, String eventName, Object data) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (IOException e) {
                emitters.remove(userId);
            }
        }
    }
}

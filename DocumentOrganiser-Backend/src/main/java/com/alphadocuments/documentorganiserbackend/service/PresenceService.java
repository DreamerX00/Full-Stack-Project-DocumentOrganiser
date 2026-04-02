package com.alphadocuments.documentorganiserbackend.service;

import com.alphadocuments.documentorganiserbackend.dto.response.PresenceEvent;
import com.alphadocuments.documentorganiserbackend.dto.response.ViewerSummary;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BiConsumer;
import java.util.stream.Collectors;

/**
 * Service for managing real-time document presence (who is viewing what).
 * Uses in-memory storage with TTL-based expiration.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PresenceService {

    private static final long HEARTBEAT_TTL_MILLIS = 2 * 60 * 1000L; // 2 minutes

    private final UserRepository userRepository;

    // Map of documentId -> Map of userId -> last heartbeat timestamp
    private final Map<UUID, Map<UUID, Instant>> documentViewers = new ConcurrentHashMap<>();

    // Cache of user summaries to avoid repeated DB lookups
    private final Map<UUID, ViewerSummary> userCache = new ConcurrentHashMap<>();

    // Callback for notifying viewers of presence changes
    private BiConsumer<UUID, PresenceEvent> presenceChangeCallback;

    /**
     * Set callback to be invoked when presence changes.
     */
    public void setPresenceChangeCallback(BiConsumer<UUID, PresenceEvent> callback) {
        this.presenceChangeCallback = callback;
    }

    /**
     * Register a heartbeat from a user viewing a document.
     * Returns true if this is a new viewer (just joined).
     */
    public boolean heartbeat(UUID documentId, UUID userId) {
        Map<UUID, Instant> viewers = documentViewers.computeIfAbsent(documentId, k -> new ConcurrentHashMap<>());
        boolean isNewViewer = !viewers.containsKey(userId);
        viewers.put(userId, Instant.now());

        if (isNewViewer) {
            log.debug("User {} joined document {}", userId, documentId);
            notifyViewerJoined(documentId, userId);
        }

        return isNewViewer;
    }

    /**
     * Remove a user from a document's viewers (explicit leave).
     */
    public void leave(UUID documentId, UUID userId) {
        Map<UUID, Instant> viewers = documentViewers.get(documentId);
        if (viewers != null && viewers.remove(userId) != null) {
            log.debug("User {} left document {}", userId, documentId);
            notifyViewerLeft(documentId, userId);
            
            // Clean up empty document entry
            if (viewers.isEmpty()) {
                documentViewers.remove(documentId);
            }
        }
    }

    /**
     * Get all current viewers of a document.
     */
    public Set<ViewerSummary> getViewers(UUID documentId) {
        Map<UUID, Instant> viewers = documentViewers.get(documentId);
        if (viewers == null || viewers.isEmpty()) {
            return Collections.emptySet();
        }

        Instant cutoff = Instant.now().minusMillis(HEARTBEAT_TTL_MILLIS);
        
        return viewers.entrySet().stream()
                .filter(e -> e.getValue().isAfter(cutoff))
                .map(e -> getOrLoadViewerSummary(e.getKey()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    /**
     * Get viewer summary for a user, loading from DB if not cached.
     */
    private ViewerSummary getOrLoadViewerSummary(UUID userId) {
        return userCache.computeIfAbsent(userId, id -> {
            Optional<User> userOpt = userRepository.findById(id);
            return userOpt.map(user -> ViewerSummary.builder()
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .profilePicture(user.getProfilePicture())
                    .build()).orElse(null);
        });
    }

    /**
     * Scheduled task to clean up expired viewers.
     * Runs every 30 seconds.
     */
    @Scheduled(fixedRate = 30000)
    public void cleanupExpiredViewers() {
        Instant cutoff = Instant.now().minusMillis(HEARTBEAT_TTL_MILLIS);
        
        documentViewers.forEach((documentId, viewers) -> {
            List<UUID> expired = viewers.entrySet().stream()
                    .filter(e -> e.getValue().isBefore(cutoff))
                    .map(Map.Entry::getKey)
                    .toList();

            for (UUID userId : expired) {
                viewers.remove(userId);
                log.debug("User {} timed out from document {}", userId, documentId);
                notifyViewerLeft(documentId, userId);
            }

            // Clean up empty document entries
            if (viewers.isEmpty()) {
                documentViewers.remove(documentId);
            }
        });
    }

    private void notifyViewerJoined(UUID documentId, UUID userId) {
        if (presenceChangeCallback != null) {
            ViewerSummary viewer = getOrLoadViewerSummary(userId);
            if (viewer != null) {
                PresenceEvent event = PresenceEvent.builder()
                        .eventType("VIEWER_JOINED")
                        .documentId(documentId)
                        .viewer(viewer)
                        .build();

                // Notify all current viewers of this document
                Map<UUID, Instant> viewers = documentViewers.get(documentId);
                if (viewers != null) {
                    viewers.keySet().forEach(viewerId -> {
                        if (!viewerId.equals(userId)) {
                            presenceChangeCallback.accept(viewerId, event);
                        }
                    });
                }
            }
        }
    }

    private void notifyViewerLeft(UUID documentId, UUID userId) {
        if (presenceChangeCallback != null) {
            ViewerSummary viewer = getOrLoadViewerSummary(userId);
            if (viewer != null) {
                PresenceEvent event = PresenceEvent.builder()
                        .eventType("VIEWER_LEFT")
                        .documentId(documentId)
                        .viewer(viewer)
                        .build();

                // Notify all remaining viewers of this document
                Map<UUID, Instant> viewers = documentViewers.get(documentId);
                if (viewers != null) {
                    viewers.keySet().forEach(viewerId -> 
                        presenceChangeCallback.accept(viewerId, event)
                    );
                }
            }
        }
    }
}

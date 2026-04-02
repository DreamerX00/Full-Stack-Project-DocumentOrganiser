package com.alphadocuments.documentorganiserbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Event payload for presence changes (viewer joined/left).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresenceEvent {
    private String eventType; // VIEWER_JOINED or VIEWER_LEFT
    private UUID documentId;
    private ViewerSummary viewer;
}

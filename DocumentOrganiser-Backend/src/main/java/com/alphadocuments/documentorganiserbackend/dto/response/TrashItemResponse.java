package com.alphadocuments.documentorganiserbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for deleted/trash items.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrashItemResponse {

    private UUID id;
    private String itemType; // DOCUMENT or FOLDER
    private UUID itemId;
    private String itemName;
    private String originalPath;
    private Long fileSize;
    private Instant deletedAt;
    private Instant expiresAt;
    private long daysUntilPermanentDeletion;
}

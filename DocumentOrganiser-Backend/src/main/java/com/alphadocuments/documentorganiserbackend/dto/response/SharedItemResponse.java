package com.alphadocuments.documentorganiserbackend.dto.response;

import com.alphadocuments.documentorganiserbackend.entity.enums.SharePermission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for shared document/folder.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SharedItemResponse {

    private UUID id;
    private String itemType; // DOCUMENT or FOLDER
    private UUID itemId;
    private String itemName;
    private String sharedByEmail;
    private String sharedByName;
    private String sharedWithEmail;
    private String sharedWithName;
    private SharePermission permission;
    private Instant expiresAt;
    private String message;
    private Instant createdAt;
    private Boolean isExpired;
}

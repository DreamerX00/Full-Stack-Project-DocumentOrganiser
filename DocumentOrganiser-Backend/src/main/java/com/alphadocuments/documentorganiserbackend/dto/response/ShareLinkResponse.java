package com.alphadocuments.documentorganiserbackend.dto.response;

import com.alphadocuments.documentorganiserbackend.entity.enums.SharePermission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for share link.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareLinkResponse {

    private UUID id;
    private String token;
    private String url;
    private String itemType; // DOCUMENT or FOLDER
    private UUID itemId;
    private String itemName;
    private SharePermission permission;
    private Instant expiresAt;
    private Boolean hasPassword;
    private Long accessCount;
    private Long maxAccessCount;
    private Boolean isActive;
    private Instant createdAt;
}

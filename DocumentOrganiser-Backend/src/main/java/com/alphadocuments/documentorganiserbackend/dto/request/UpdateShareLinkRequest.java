package com.alphadocuments.documentorganiserbackend.dto.request;

import com.alphadocuments.documentorganiserbackend.entity.enums.SharePermission;
import lombok.Data;

import java.time.Instant;

/**
 * Request DTO for updating a share link.
 */
@Data
public class UpdateShareLinkRequest {
    private SharePermission permission;
    private Instant expiresAt;
    private String password; // null = no change, empty string = remove password
    private Boolean isActive;
    private Long maxAccessCount;
}

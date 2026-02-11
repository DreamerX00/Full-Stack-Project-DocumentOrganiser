package com.alphadocuments.documentorganiserbackend.dto.request;

import com.alphadocuments.documentorganiserbackend.entity.enums.SharePermission;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Request DTO for creating a share link.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateShareLinkRequest {

    @NotNull(message = "Permission is required")
    private SharePermission permission;

    private Instant expiresAt;

    private String password;

    private Long maxAccessCount;
}

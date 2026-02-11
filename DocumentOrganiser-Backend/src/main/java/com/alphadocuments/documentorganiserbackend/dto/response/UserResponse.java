package com.alphadocuments.documentorganiserbackend.dto.response;

import com.alphadocuments.documentorganiserbackend.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for user information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private String email;
    private String name;
    private String profilePicture;
    private Role role;
    private Boolean emailVerified;
    private Long storageUsedBytes;
    private Long storageLimitBytes;
    private Instant createdAt;
    private UserSettingsResponse settings;
}

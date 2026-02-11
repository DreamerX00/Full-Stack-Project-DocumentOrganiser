package com.alphadocuments.documentorganiserbackend.dto.request;

import com.alphadocuments.documentorganiserbackend.entity.enums.SharePermission;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Request DTO for sharing with a user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareWithUserRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Permission is required")
    private SharePermission permission;

    private Instant expiresAt;

    private String message;
}

package com.alphadocuments.documentorganiserbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for user settings.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsResponse {

    private String theme;
    private String language;
    private Long storageLimitMb;
    private Boolean notificationsEnabled;
    private Boolean emailNotificationsEnabled;
    private String defaultView;
    private String sortBy;
    private String sortOrder;
}

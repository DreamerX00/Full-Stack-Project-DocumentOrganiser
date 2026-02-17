package com.alphadocuments.documentorganiserbackend.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating user settings.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSettingsRequest {

    @Pattern(regexp = "^(light|dark)$", message = "Theme must be 'light' or 'dark'")
    private String theme;

    @Pattern(regexp = "^[a-z]{2}$", message = "Language must be a 2-letter code")
    private String language;

    private Boolean notificationsEnabled;

    private Boolean emailNotificationsEnabled;

    @Pattern(regexp = "^(grid|list)$", message = "Default view must be 'grid' or 'list'")
    private String defaultView;

    @Pattern(regexp = "^(name|date|size|type)$", message = "Sort by must be 'name', 'date', 'size', or 'type'")
    private String sortBy;

    @Pattern(regexp = "^(asc|desc)$", message = "Sort order must be 'asc' or 'desc'")
    private String sortOrder;

    // Onboarding fields
    private String profession;
    private String subcategory;
    private String specialization;
    private Boolean onboardingComplete;
}

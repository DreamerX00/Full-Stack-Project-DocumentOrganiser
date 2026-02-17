package com.alphadocuments.documentorganiserbackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * User settings entity for storing user preferences.
 */
@Entity
@Table(name = "user_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "theme")
    @Builder.Default
    private String theme = "light";

    @Column(name = "language")
    @Builder.Default
    private String language = "en";

    @Column(name = "storage_limit_mb")
    @Builder.Default
    private Long storageLimitMb = 100L;

    @Column(name = "notifications_enabled")
    @Builder.Default
    private Boolean notificationsEnabled = true;

    @Column(name = "email_notifications_enabled")
    @Builder.Default
    private Boolean emailNotificationsEnabled = true;

    @Column(name = "default_view")
    @Builder.Default
    private String defaultView = "grid"; // grid or list

    @Column(name = "sort_by")
    @Builder.Default
    private String sortBy = "name"; // name, date, size, type

    @Column(name = "sort_order")
    @Builder.Default
    private String sortOrder = "asc"; // asc or desc

    // Onboarding fields
    @Column(name = "profession")
    private String profession;

    @Column(name = "subcategory")
    private String subcategory;

    @Column(name = "specialization")
    private String specialization;

    @Column(name = "onboarding_complete")
    @Builder.Default
    private Boolean onboardingComplete = false;
}

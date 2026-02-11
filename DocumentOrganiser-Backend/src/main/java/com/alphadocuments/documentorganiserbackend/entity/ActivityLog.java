package com.alphadocuments.documentorganiserbackend.entity;

import com.alphadocuments.documentorganiserbackend.entity.enums.ActivityType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Activity log entity for audit trail.
 */
@Entity
@Table(name = "activity_logs", indexes = {
    @Index(name = "idx_activity_logs_user_id", columnList = "user_id"),
    @Index(name = "idx_activity_logs_activity_type", columnList = "activity_type"),
    @Index(name = "idx_activity_logs_created_at", columnList = "created_at"),
    @Index(name = "idx_activity_logs_resource", columnList = "resource_type, resource_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;

    @Column(name = "resource_type", nullable = false)
    private String resourceType; // DOCUMENT, FOLDER, USER, etc.

    @Column(name = "resource_id")
    private UUID resourceId;

    @Column(name = "resource_name")
    private String resourceName;

    @Column(name = "description")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;
}

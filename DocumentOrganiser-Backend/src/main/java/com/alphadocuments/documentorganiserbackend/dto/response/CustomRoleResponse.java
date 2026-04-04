package com.alphadocuments.documentorganiserbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for workspace custom role.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomRoleResponse {

    private UUID id;
    private UUID workspaceId;
    private String name;
    private String description;
    private Boolean isSystemRole;
    private Boolean isDefaultRole;
    private List<String> permissions;
    private String color;
    private Integer priority;
    private UUID createdBy;
    private String createdByName;
    private Instant createdAt;
    private Instant updatedAt;

    /**
     * Number of members assigned to this role.
     */
    private Long memberCount;
}

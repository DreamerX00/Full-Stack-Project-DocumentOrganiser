package com.alphadocuments.documentorganiserbackend.dto.response;

import com.alphadocuments.documentorganiserbackend.entity.enums.WorkspaceRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for workspace information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceResponse {

    private UUID id;
    private String name;
    private String slug;
    private String description;
    private String avatarUrl;
    private UUID ownerId;
    private String ownerName;
    private String ownerEmail;
    private Long memberCount;
    private WorkspaceRole currentUserRole;
    private Instant createdAt;
    private Instant updatedAt;
}

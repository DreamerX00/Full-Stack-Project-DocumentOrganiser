package com.alphadocuments.documentorganiserbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO containing all available permissions.
 * Used for role permission editor UI.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailablePermissionsResponse {

    private List<PermissionGroup> groups;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PermissionGroup {
        private String name;
        private String description;
        private List<Permission> permissions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Permission {
        private String code;
        private String name;
        private String description;
    }

    /**
     * Factory method to create the standard permissions response.
     */
    public static AvailablePermissionsResponse standard() {
        return AvailablePermissionsResponse.builder()
            .groups(List.of(
                PermissionGroup.builder()
                    .name("Workspace")
                    .description("Workspace-level permissions")
                    .permissions(List.of(
                        Permission.builder().code("workspace:read").name("View Workspace").description("View workspace details and settings").build(),
                        Permission.builder().code("workspace:manage").name("Manage Workspace").description("Edit workspace settings").build(),
                        Permission.builder().code("workspace:delete").name("Delete Workspace").description("Permanently delete the workspace").build()
                    ))
                    .build(),
                PermissionGroup.builder()
                    .name("Folders")
                    .description("Folder management permissions")
                    .permissions(List.of(
                        Permission.builder().code("folder:create").name("Create Folders").description("Create new folders").build(),
                        Permission.builder().code("folder:read").name("View Folders").description("View folder contents").build(),
                        Permission.builder().code("folder:update").name("Edit Folders").description("Rename and modify folders").build(),
                        Permission.builder().code("folder:delete").name("Delete Folders").description("Delete folders").build(),
                        Permission.builder().code("folder:*").name("Full Folder Access").description("All folder permissions").build()
                    ))
                    .build(),
                PermissionGroup.builder()
                    .name("Documents")
                    .description("Document management permissions")
                    .permissions(List.of(
                        Permission.builder().code("document:create").name("Upload Documents").description("Upload new documents").build(),
                        Permission.builder().code("document:read").name("View Documents").description("View document details").build(),
                        Permission.builder().code("document:update").name("Edit Documents").description("Modify document metadata").build(),
                        Permission.builder().code("document:delete").name("Delete Documents").description("Delete documents").build(),
                        Permission.builder().code("document:download").name("Download Documents").description("Download document files").build(),
                        Permission.builder().code("document:*").name("Full Document Access").description("All document permissions").build()
                    ))
                    .build(),
                PermissionGroup.builder()
                    .name("Members")
                    .description("Member management permissions")
                    .permissions(List.of(
                        Permission.builder().code("member:invite").name("Invite Members").description("Invite new members to workspace").build(),
                        Permission.builder().code("member:remove").name("Remove Members").description("Remove members from workspace").build(),
                        Permission.builder().code("member:update_role").name("Change Roles").description("Change member roles").build(),
                        Permission.builder().code("member:*").name("Full Member Access").description("All member permissions").build()
                    ))
                    .build(),
                PermissionGroup.builder()
                    .name("Roles")
                    .description("Role management permissions")
                    .permissions(List.of(
                        Permission.builder().code("role:create").name("Create Roles").description("Create custom roles").build(),
                        Permission.builder().code("role:read").name("View Roles").description("View role definitions").build(),
                        Permission.builder().code("role:update").name("Edit Roles").description("Modify role permissions").build(),
                        Permission.builder().code("role:delete").name("Delete Roles").description("Delete custom roles").build()
                    ))
                    .build(),
                PermissionGroup.builder()
                    .name("Tags")
                    .description("Tag management permissions")
                    .permissions(List.of(
                        Permission.builder().code("tag:create").name("Create Tags").description("Create new tags").build(),
                        Permission.builder().code("tag:read").name("View Tags").description("View available tags").build(),
                        Permission.builder().code("tag:update").name("Edit Tags").description("Modify tag definitions").build(),
                        Permission.builder().code("tag:delete").name("Delete Tags").description("Delete tags").build(),
                        Permission.builder().code("tag:assign").name("Assign Tags").description("Tag resources").build()
                    ))
                    .build(),
                PermissionGroup.builder()
                    .name("Sharing")
                    .description("Sharing permissions")
                    .permissions(List.of(
                        Permission.builder().code("share:create").name("Create Share Links").description("Create share links").build(),
                        Permission.builder().code("share:manage").name("Manage Shares").description("Manage all share links").build()
                    ))
                    .build(),
                PermissionGroup.builder()
                    .name("Audit")
                    .description("Audit and compliance permissions")
                    .permissions(List.of(
                        Permission.builder().code("audit:read").name("View Audit Logs").description("View workspace audit logs").build(),
                        Permission.builder().code("audit:export").name("Export Audit Logs").description("Export audit logs").build()
                    ))
                    .build(),
                PermissionGroup.builder()
                    .name("Policies")
                    .description("Policy management permissions")
                    .permissions(List.of(
                        Permission.builder().code("policy:create").name("Create Policies").description("Create access policies").build(),
                        Permission.builder().code("policy:read").name("View Policies").description("View policy definitions").build(),
                        Permission.builder().code("policy:update").name("Edit Policies").description("Modify policies").build(),
                        Permission.builder().code("policy:delete").name("Delete Policies").description("Delete policies").build()
                    ))
                    .build()
            ))
            .build();
    }
}

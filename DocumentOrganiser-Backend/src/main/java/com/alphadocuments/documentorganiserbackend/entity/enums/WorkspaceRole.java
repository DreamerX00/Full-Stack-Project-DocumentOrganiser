package com.alphadocuments.documentorganiserbackend.entity.enums;

/**
 * Roles within a workspace.
 */
public enum WorkspaceRole {
    OWNER,    // Full control, can delete workspace
    ADMIN,    // Can manage members, settings
    MEMBER,   // Can create/edit documents and folders
    VIEWER    // Read-only access
}

package com.alphadocuments.documentorganiserbackend.entity.enums;

/**
 * Permission levels for document/folder sharing.
 */
public enum SharePermission {
    VIEW,       // Can only view
    DOWNLOAD,   // Can view and download
    EDIT        // Can view, download, and upload new versions
}

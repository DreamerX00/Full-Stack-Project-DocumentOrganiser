package com.alphadocuments.documentorganiserbackend.entity.enums;

/**
 * Types of activities for audit logging.
 */
public enum ActivityType {
    // Document activities
    DOCUMENT_UPLOADED,
    DOCUMENT_DOWNLOADED,
    DOCUMENT_UPDATED,
    DOCUMENT_DELETED,
    DOCUMENT_MOVED,
    DOCUMENT_COPIED,
    DOCUMENT_RENAMED,
    DOCUMENT_RESTORED,
    DOCUMENT_FAVORITED,
    DOCUMENT_UNFAVORITED,

    // Folder activities
    FOLDER_CREATED,
    FOLDER_UPDATED,
    FOLDER_DELETED,
    FOLDER_MOVED,
    FOLDER_RENAMED,
    FOLDER_RESTORED,

    // Sharing activities
    DOCUMENT_SHARED,
    DOCUMENT_UNSHARED,
    FOLDER_SHARED,
    FOLDER_UNSHARED,
    SHARE_LINK_CREATED,
    SHARE_LINK_ACCESSED,
    SHARE_LINK_DELETED,

    // User activities
    USER_LOGIN,
    USER_LOGOUT,
    USER_PROFILE_UPDATED,
    USER_SETTINGS_UPDATED,

    // Trash activities
    ITEM_TRASHED,
    ITEM_RESTORED,
    TRASH_EMPTIED
}

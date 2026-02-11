package com.alphadocuments.documentorganiserbackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * Folder entity representing a folder in the document hierarchy.
 * Supports nested folders via self-referencing relationship.
 */
@Entity
@Table(name = "folders", indexes = {
    @Index(name = "idx_folders_user_id", columnList = "user_id"),
    @Index(name = "idx_folders_parent_id", columnList = "parent_folder_id"),
    @Index(name = "idx_folders_path", columnList = "path"),
    @Index(name = "idx_folders_deleted", columnList = "is_deleted")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Folder extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "path", nullable = false)
    private String path; // Full path like /root/subfolder/current

    @Column(name = "color")
    private String color; // Hex color code for folder icon

    @Column(name = "description")
    private String description;

    @Column(name = "is_root")
    @Builder.Default
    private Boolean isRoot = false;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_folder_id")
    private Folder parentFolder;

    @OneToMany(mappedBy = "parentFolder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Folder> subFolders = new HashSet<>();

    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Document> documents = new HashSet<>();

    /**
     * Updates the path based on parent folder.
     */
    public void updatePath() {
        if (parentFolder == null || isRoot) {
            this.path = "/" + name;
        } else {
            this.path = parentFolder.getPath() + "/" + name;
        }
    }
}

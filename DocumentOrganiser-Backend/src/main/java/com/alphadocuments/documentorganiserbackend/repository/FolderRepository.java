package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.Folder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Folder entity.
 */
@Repository
public interface FolderRepository extends JpaRepository<Folder, UUID> {

    // ── Personal folders (no workspace) ──────────────────────────────────
    List<Folder> findByUserIdAndIsDeletedFalse(UUID userId);

    List<Folder> findByUserIdAndParentFolderIdAndIsDeletedFalse(UUID userId, UUID parentFolderId);

    List<Folder> findByUserIdAndParentFolderIsNullAndIsDeletedFalse(UUID userId);

    @Query("SELECT f FROM Folder f WHERE f.user.id = :userId AND f.parentFolder IS NULL AND f.workspace IS NULL AND f.isDeleted = false")
    List<Folder> findPersonalRootFolders(@Param("userId") UUID userId);

    Optional<Folder> findByUserIdAndIsRootTrue(UUID userId);

    Optional<Folder> findByIdAndUserIdAndIsDeletedFalse(UUID id, UUID userId);

    boolean existsByUserIdAndParentFolderIdAndNameAndIsDeletedFalse(UUID userId, UUID parentFolderId, String name);

    @Query("SELECT f FROM Folder f WHERE f.user.id = :userId AND f.isDeleted = false AND LOWER(f.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Folder> searchByName(@Param("userId") UUID userId, @Param("name") String name, Pageable pageable);

    @Query("SELECT f FROM Folder f WHERE f.user.id = :userId AND f.path LIKE :pathPrefix AND f.isDeleted = false")
    List<Folder> findByUserIdAndPathStartingWith(@Param("userId") UUID userId, @Param("pathPrefix") String pathPrefix);

    List<Folder> findByUserIdAndIsDeletedTrue(UUID userId);

    @Query("SELECT COUNT(f) FROM Folder f WHERE f.user.id = :userId AND f.isDeleted = false")
    long countByUserIdAndNotDeleted(@Param("userId") UUID userId);

    // ── Workspace folders ────────────────────────────────────────────────

    /**
     * Find root folders within a workspace (no parent folder).
     */
    @Query("SELECT f FROM Folder f WHERE f.workspace.id = :workspaceId AND f.parentFolder IS NULL AND f.isDeleted = false ORDER BY f.name")
    List<Folder> findWorkspaceRootFolders(@Param("workspaceId") UUID workspaceId);

    /**
     * Find subfolders within a workspace under a specific parent folder.
     */
    @Query("SELECT f FROM Folder f WHERE f.workspace.id = :workspaceId AND f.parentFolder.id = :parentFolderId AND f.isDeleted = false ORDER BY f.name")
    List<Folder> findWorkspaceSubfolders(@Param("workspaceId") UUID workspaceId, @Param("parentFolderId") UUID parentFolderId);

    /**
     * Check if a folder with the same name exists in the workspace at the same location.
     */
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Folder f " +
           "WHERE f.workspace.id = :workspaceId AND f.parentFolder.id = :parentFolderId AND f.name = :name AND f.isDeleted = false")
    boolean existsByWorkspaceIdAndParentFolderIdAndName(@Param("workspaceId") UUID workspaceId, @Param("parentFolderId") UUID parentFolderId, @Param("name") String name);

    /**
     * Check if a root folder with the same name exists in the workspace.
     */
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Folder f " +
           "WHERE f.workspace.id = :workspaceId AND f.parentFolder IS NULL AND f.name = :name AND f.isDeleted = false")
    boolean existsByWorkspaceIdAndRootAndName(@Param("workspaceId") UUID workspaceId, @Param("name") String name);

    /**
     * Find a folder by ID within a workspace.
     */
    @Query("SELECT f FROM Folder f WHERE f.id = :folderId AND f.workspace.id = :workspaceId AND f.isDeleted = false")
    Optional<Folder> findByIdAndWorkspaceId(@Param("folderId") UUID folderId, @Param("workspaceId") UUID workspaceId);

    /**
     * Search folders within a workspace.
     */
    @Query("SELECT f FROM Folder f WHERE f.workspace.id = :workspaceId AND f.isDeleted = false AND LOWER(f.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Folder> searchByWorkspaceAndName(@Param("workspaceId") UUID workspaceId, @Param("name") String name, Pageable pageable);
}

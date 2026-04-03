package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.Document;
import com.alphadocuments.documentorganiserbackend.entity.enums.DocumentCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Document entity.
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID>, JpaSpecificationExecutor<Document> {

    // ── Personal documents (no workspace) ────────────────────────────────
    List<Document> findByUserIdAndIsDeletedFalse(UUID userId);

    List<Document> findByUserIdAndFolderIdAndIsDeletedFalse(UUID userId, UUID folderId);

    Page<Document> findByUserIdAndFolderIdAndIsDeletedFalse(UUID userId, UUID folderId, Pageable pageable);

    List<Document> findByUserIdAndFolderIsNullAndIsDeletedFalse(UUID userId);

    Page<Document> findByUserIdAndFolderIsNullAndIsDeletedFalse(UUID userId, Pageable pageable);

    Optional<Document> findByIdAndUserIdAndIsDeletedFalse(UUID id, UUID userId);

    Page<Document> findByUserIdAndIsDeletedFalse(UUID userId, Pageable pageable);

    Page<Document> findByUserIdAndCategoryAndIsDeletedFalse(UUID userId, DocumentCategory category, Pageable pageable);

    Page<Document> findByUserIdAndIsFavoriteTrueAndIsDeletedFalse(UUID userId, Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.user.id = :userId AND d.isDeleted = false ORDER BY d.lastAccessedAt DESC NULLS LAST")
    Page<Document> findRecentDocuments(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.user.id = :userId AND d.isDeleted = false AND " +
           "(LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.originalName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Document> searchByName(@Param("userId") UUID userId, @Param("query") String query, Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.user.id = :userId AND d.isDeleted = false AND d.fileType IN :types")
    Page<Document> findByFileTypes(@Param("userId") UUID userId, @Param("types") List<String> types, Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.user.id = :userId AND d.isDeleted = false AND d.createdAt BETWEEN :from AND :to")
    Page<Document> findByDateRange(@Param("userId") UUID userId, @Param("from") Instant from, @Param("to") Instant to, Pageable pageable);

    @Query("SELECT SUM(d.fileSize) FROM Document d WHERE d.user.id = :userId AND d.isDeleted = false")
    Long getTotalStorageUsed(@Param("userId") UUID userId);

    @Query("SELECT d.category, COUNT(d) FROM Document d WHERE d.user.id = :userId AND d.isDeleted = false GROUP BY d.category")
    List<Object[]> countByCategory(@Param("userId") UUID userId);

    List<Document> findByUserIdAndIsDeletedTrue(UUID userId);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.user.id = :userId AND d.isDeleted = false")
    long countByUserIdAndNotDeleted(@Param("userId") UUID userId);

    boolean existsByUserIdAndFolderIdAndNameAndIsDeletedFalse(UUID userId, UUID folderId, String name);

    boolean existsByUserIdAndFolderIsNullAndNameAndIsDeletedFalse(UUID userId, String name);

    Optional<Document> findFirstByUserIdAndFolderIdAndNameAndIsDeletedFalse(UUID userId, UUID folderId, String name);

    Optional<Document> findFirstByUserIdAndFolderIsNullAndNameAndIsDeletedFalse(UUID userId, String name);

    /**
     * Find existing document with same checksum for deduplication.
     */
    Optional<Document> findFirstByUserIdAndChecksumAndIsDeletedFalse(UUID userId, String checksum);

    // ── Workspace documents ──────────────────────────────────────────────

    /**
     * Find documents in a workspace folder.
     */
    @Query("SELECT d FROM Document d WHERE d.workspace.id = :workspaceId AND d.folder.id = :folderId AND d.isDeleted = false")
    Page<Document> findByWorkspaceIdAndFolderId(@Param("workspaceId") UUID workspaceId, @Param("folderId") UUID folderId, Pageable pageable);

    /**
     * Find root-level documents in a workspace (no folder).
     */
    @Query("SELECT d FROM Document d WHERE d.workspace.id = :workspaceId AND d.folder IS NULL AND d.isDeleted = false")
    Page<Document> findByWorkspaceIdAndFolderIsNull(@Param("workspaceId") UUID workspaceId, Pageable pageable);

    /**
     * Find all documents in a workspace.
     */
    @Query("SELECT d FROM Document d WHERE d.workspace.id = :workspaceId AND d.isDeleted = false")
    Page<Document> findByWorkspaceId(@Param("workspaceId") UUID workspaceId, Pageable pageable);

    /**
     * Check if a document with same name exists in a workspace folder.
     */
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Document d " +
           "WHERE d.workspace.id = :workspaceId AND d.folder.id = :folderId AND d.name = :name AND d.isDeleted = false")
    boolean existsByWorkspaceIdAndFolderIdAndName(@Param("workspaceId") UUID workspaceId, @Param("folderId") UUID folderId, @Param("name") String name);

    /**
     * Check if a root-level document with same name exists in a workspace.
     */
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Document d " +
           "WHERE d.workspace.id = :workspaceId AND d.folder IS NULL AND d.name = :name AND d.isDeleted = false")
    boolean existsByWorkspaceIdAndRootAndName(@Param("workspaceId") UUID workspaceId, @Param("name") String name);

    /**
     * Find a document by ID within a workspace.
     */
    @Query("SELECT d FROM Document d WHERE d.id = :documentId AND d.workspace.id = :workspaceId AND d.isDeleted = false")
    Optional<Document> findByIdAndWorkspaceId(@Param("documentId") UUID documentId, @Param("workspaceId") UUID workspaceId);

    /**
     * Find first document with same name in workspace folder (for conflict resolution).
     */
    @Query("SELECT d FROM Document d WHERE d.workspace.id = :workspaceId AND d.folder.id = :folderId AND d.name = :name AND d.isDeleted = false")
    Optional<Document> findFirstByWorkspaceIdAndFolderIdAndName(@Param("workspaceId") UUID workspaceId, @Param("folderId") UUID folderId, @Param("name") String name);

    /**
     * Find first root-level document with same name in workspace (for conflict resolution).
     */
    @Query("SELECT d FROM Document d WHERE d.workspace.id = :workspaceId AND d.folder IS NULL AND d.name = :name AND d.isDeleted = false")
    Optional<Document> findFirstByWorkspaceIdAndRootAndName(@Param("workspaceId") UUID workspaceId, @Param("name") String name);

    /**
     * Search documents within a workspace.
     */
    @Query("SELECT d FROM Document d WHERE d.workspace.id = :workspaceId AND d.isDeleted = false AND " +
           "(LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.originalName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Document> searchByWorkspaceAndName(@Param("workspaceId") UUID workspaceId, @Param("query") String query, Pageable pageable);
}

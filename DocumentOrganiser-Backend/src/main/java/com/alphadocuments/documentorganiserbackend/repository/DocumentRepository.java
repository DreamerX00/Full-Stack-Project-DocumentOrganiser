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
}

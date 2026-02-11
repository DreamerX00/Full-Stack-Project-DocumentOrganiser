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

    List<Folder> findByUserIdAndIsDeletedFalse(UUID userId);

    List<Folder> findByUserIdAndParentFolderIdAndIsDeletedFalse(UUID userId, UUID parentFolderId);

    List<Folder> findByUserIdAndParentFolderIsNullAndIsDeletedFalse(UUID userId);

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
}

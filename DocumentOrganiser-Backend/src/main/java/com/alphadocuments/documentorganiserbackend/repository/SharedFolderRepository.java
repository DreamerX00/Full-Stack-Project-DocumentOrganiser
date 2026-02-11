package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.SharedFolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for SharedFolder entity.
 */
@Repository
public interface SharedFolderRepository extends JpaRepository<SharedFolder, UUID> {

    List<SharedFolder> findByFolderId(UUID folderId);

    Page<SharedFolder> findBySharedWithId(UUID userId, Pageable pageable);

    Page<SharedFolder> findBySharedById(UUID userId, Pageable pageable);

    Optional<SharedFolder> findByFolderIdAndSharedWithId(UUID folderId, UUID sharedWithId);

    boolean existsByFolderIdAndSharedWithId(UUID folderId, UUID sharedWithId);

    void deleteByFolderId(UUID folderId);
}

package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.SharedDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for SharedDocument entity.
 */
@Repository
public interface SharedDocumentRepository extends JpaRepository<SharedDocument, UUID> {

    List<SharedDocument> findByDocumentId(UUID documentId);

    Page<SharedDocument> findBySharedWithId(UUID userId, Pageable pageable);

    Page<SharedDocument> findBySharedById(UUID userId, Pageable pageable);

    Optional<SharedDocument> findByDocumentIdAndSharedWithId(UUID documentId, UUID sharedWithId);

    boolean existsByDocumentIdAndSharedWithId(UUID documentId, UUID sharedWithId);

    void deleteByDocumentId(UUID documentId);
}

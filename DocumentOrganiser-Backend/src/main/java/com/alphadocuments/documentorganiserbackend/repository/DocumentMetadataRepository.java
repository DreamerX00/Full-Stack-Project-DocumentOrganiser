package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.DocumentMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for DocumentMetadata entity.
 */
@Repository
public interface DocumentMetadataRepository extends JpaRepository<DocumentMetadata, UUID> {

    Optional<DocumentMetadata> findByDocumentId(UUID documentId);
}

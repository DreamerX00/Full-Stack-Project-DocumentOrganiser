package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.ShareLink;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for ShareLink entity.
 */
@Repository
public interface ShareLinkRepository extends JpaRepository<ShareLink, UUID> {

    Optional<ShareLink> findByToken(String token);

    List<ShareLink> findByDocumentId(UUID documentId);

    List<ShareLink> findByFolderId(UUID folderId);

    Page<ShareLink> findByCreatedById(UUID userId, Pageable pageable);

    @Modifying
    @Query("UPDATE ShareLink s SET s.isActive = false WHERE s.expiresAt < :now AND s.isActive = true")
    void deactivateExpiredLinks(@Param("now") Instant now);

    @Modifying
    @Query("UPDATE ShareLink s SET s.accessCount = s.accessCount + 1 WHERE s.id = :id")
    void incrementAccessCount(@Param("id") UUID id);
}

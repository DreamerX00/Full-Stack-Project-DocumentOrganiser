package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.DocumentTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for DocumentTag entity.
 */
@Repository
public interface DocumentTagRepository extends JpaRepository<DocumentTag, UUID> {

    List<DocumentTag> findByDocumentId(UUID documentId);

    Optional<DocumentTag> findByDocumentIdAndName(UUID documentId, String name);

    void deleteByDocumentIdAndName(UUID documentId, String name);

    @Query("SELECT DISTINCT t.name FROM DocumentTag t WHERE t.document.user.id = :userId")
    List<String> findDistinctTagsByUserId(@Param("userId") UUID userId);

    @Query("SELECT t.document.id FROM DocumentTag t WHERE t.name = :tagName AND t.document.user.id = :userId")
    List<UUID> findDocumentIdsByTagName(@Param("userId") UUID userId, @Param("tagName") String tagName);
}

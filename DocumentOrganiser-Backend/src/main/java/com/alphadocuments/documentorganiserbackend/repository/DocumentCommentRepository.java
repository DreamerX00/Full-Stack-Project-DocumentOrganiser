package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.DocumentComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DocumentCommentRepository extends JpaRepository<DocumentComment, UUID> {

    Page<DocumentComment> findByDocumentIdOrderByCreatedAtDesc(UUID documentId, Pageable pageable);

    long countByDocumentId(UUID documentId);

    @Query("SELECT COUNT(c) FROM DocumentComment c WHERE c.parent.id = :parentId")
    int countReplies(@Param("parentId") UUID parentId);
}

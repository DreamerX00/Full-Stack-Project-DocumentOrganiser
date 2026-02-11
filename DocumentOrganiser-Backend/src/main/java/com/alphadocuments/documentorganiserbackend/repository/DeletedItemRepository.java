package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.DeletedItem;
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
 * Repository for DeletedItem entity.
 */
@Repository
public interface DeletedItemRepository extends JpaRepository<DeletedItem, UUID> {

    Page<DeletedItem> findByUserIdOrderByDeletedAtDesc(UUID userId, Pageable pageable);

    Optional<DeletedItem> findByIdAndUserId(UUID id, UUID userId);

    Optional<DeletedItem> findByItemTypeAndItemIdAndUserId(String itemType, UUID itemId, UUID userId);

    List<DeletedItem> findByExpiresAtBefore(Instant now);

    @Modifying
    @Query("DELETE FROM DeletedItem d WHERE d.user.id = :userId")
    void deleteAllByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query("DELETE FROM DeletedItem d WHERE d.expiresAt < :now")
    void deleteExpiredItems(@Param("now") Instant now);
}

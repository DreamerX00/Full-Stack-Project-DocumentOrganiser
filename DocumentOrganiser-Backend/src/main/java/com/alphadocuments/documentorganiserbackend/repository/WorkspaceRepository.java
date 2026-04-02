package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.Workspace;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {

    Optional<Workspace> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT w FROM Workspace w JOIN w.members m WHERE m.user.id = :userId")
    Page<Workspace> findByMemberUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT COUNT(w) FROM Workspace w JOIN w.members m WHERE m.user.id = :userId")
    long countByMemberUserId(@Param("userId") UUID userId);

    Page<Workspace> findByOwnerId(UUID ownerId, Pageable pageable);
}

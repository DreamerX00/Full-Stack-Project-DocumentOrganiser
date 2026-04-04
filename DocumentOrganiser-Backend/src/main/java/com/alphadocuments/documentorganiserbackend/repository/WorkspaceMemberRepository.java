package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.WorkspaceMember;
import com.alphadocuments.documentorganiserbackend.entity.enums.WorkspaceRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, UUID> {

    Page<WorkspaceMember> findByWorkspaceId(UUID workspaceId, Pageable pageable);

    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

    boolean existsByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

    long countByWorkspaceId(UUID workspaceId);

    long countByWorkspaceIdAndRole(UUID workspaceId, WorkspaceRole role);

    void deleteByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

    /**
     * Count members assigned to a specific custom role.
     */
    @Query("SELECT COUNT(m) FROM WorkspaceMember m WHERE m.customRole.id = :roleId")
    long countByCustomRoleId(@Param("roleId") UUID roleId);

    /**
     * Find members assigned to a specific custom role.
     */
    @Query("SELECT m FROM WorkspaceMember m WHERE m.customRole.id = :roleId")
    List<WorkspaceMember> findByCustomRoleId(@Param("roleId") UUID roleId);

    /**
     * Find members in a workspace with their custom roles eagerly loaded.
     */
    @Query("SELECT m FROM WorkspaceMember m LEFT JOIN FETCH m.customRole WHERE m.workspace.id = :workspaceId")
    List<WorkspaceMember> findByWorkspaceIdWithRoles(@Param("workspaceId") UUID workspaceId);
}

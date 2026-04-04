package com.alphadocuments.documentorganiserbackend.repository;

import com.alphadocuments.documentorganiserbackend.entity.WorkspaceCustomRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for WorkspaceCustomRole entities.
 */
@Repository
public interface WorkspaceCustomRoleRepository extends JpaRepository<WorkspaceCustomRole, UUID> {

    /**
     * Find all roles for a workspace, ordered by priority descending.
     */
    @Query("SELECT r FROM WorkspaceCustomRole r WHERE r.workspace.id = :workspaceId ORDER BY r.priority DESC, r.name ASC")
    List<WorkspaceCustomRole> findByWorkspaceId(@Param("workspaceId") UUID workspaceId);

    /**
     * Find all system roles for a workspace.
     */
    @Query("SELECT r FROM WorkspaceCustomRole r WHERE r.workspace.id = :workspaceId AND r.isSystemRole = true ORDER BY r.priority DESC")
    List<WorkspaceCustomRole> findSystemRolesByWorkspaceId(@Param("workspaceId") UUID workspaceId);

    /**
     * Find all custom (non-system) roles for a workspace.
     */
    @Query("SELECT r FROM WorkspaceCustomRole r WHERE r.workspace.id = :workspaceId AND r.isSystemRole = false ORDER BY r.priority DESC, r.name ASC")
    List<WorkspaceCustomRole> findCustomRolesByWorkspaceId(@Param("workspaceId") UUID workspaceId);

    /**
     * Find a role by workspace and name.
     */
    @Query("SELECT r FROM WorkspaceCustomRole r WHERE r.workspace.id = :workspaceId AND r.name = :name")
    Optional<WorkspaceCustomRole> findByWorkspaceIdAndName(@Param("workspaceId") UUID workspaceId, @Param("name") String name);

    /**
     * Check if a role name exists in a workspace.
     */
    @Query("SELECT COUNT(r) > 0 FROM WorkspaceCustomRole r WHERE r.workspace.id = :workspaceId AND r.name = :name")
    boolean existsByWorkspaceIdAndName(@Param("workspaceId") UUID workspaceId, @Param("name") String name);

    /**
     * Check if a role name exists in a workspace excluding a specific role.
     */
    @Query("SELECT COUNT(r) > 0 FROM WorkspaceCustomRole r WHERE r.workspace.id = :workspaceId AND r.name = :name AND r.id != :excludeId")
    boolean existsByWorkspaceIdAndNameExcluding(@Param("workspaceId") UUID workspaceId, @Param("name") String name, @Param("excludeId") UUID excludeId);

    /**
     * Find the default role for a workspace.
     */
    @Query("SELECT r FROM WorkspaceCustomRole r WHERE r.workspace.id = :workspaceId AND r.isDefaultRole = true")
    Optional<WorkspaceCustomRole> findDefaultRoleByWorkspaceId(@Param("workspaceId") UUID workspaceId);

    /**
     * Count custom (non-system) roles in a workspace.
     */
    @Query("SELECT COUNT(r) FROM WorkspaceCustomRole r WHERE r.workspace.id = :workspaceId AND r.isSystemRole = false")
    long countCustomRolesByWorkspaceId(@Param("workspaceId") UUID workspaceId);

    /**
     * Find roles that have a specific permission.
     */
    @Query(value = "SELECT r.* FROM workspace_custom_roles r WHERE r.workspace_id = :workspaceId AND r.permissions @> :permission::jsonb", nativeQuery = true)
    List<WorkspaceCustomRole> findByWorkspaceIdAndPermissionContains(@Param("workspaceId") UUID workspaceId, @Param("permission") String permission);
}

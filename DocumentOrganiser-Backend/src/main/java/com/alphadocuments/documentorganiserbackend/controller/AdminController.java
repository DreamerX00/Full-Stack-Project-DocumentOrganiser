package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.PagedResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.UserResponse;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.entity.enums.Role;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.repository.DocumentRepository;
import com.alphadocuments.documentorganiserbackend.repository.FolderRepository;
import com.alphadocuments.documentorganiserbackend.repository.UserRepository;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * REST controller for admin management endpoints.
 * All endpoints require ADMIN role.
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin management APIs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final FolderRepository folderRepository;

    @GetMapping("/users")
    @Operation(summary = "List all users", description = "Admin: Get all users with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> listUsers(
            @CurrentUser UserPrincipal userPrincipal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<User> page = userRepository.findAll(pageable);
        PagedResponse<UserResponse> response = PagedResponse.<UserResponse>builder()
                .content(page.getContent().stream().map(this::mapToResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/stats")
    @Operation(summary = "System statistics", description = "Admin: Get system-wide statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats(
            @CurrentUser UserPrincipal userPrincipal) {

        long totalUsers = userRepository.count();
        long totalDocuments = documentRepository.count();
        long totalFolders = folderRepository.count();

        Map<String, Object> stats = Map.of(
                "totalUsers", totalUsers,
                "totalDocuments", totalDocuments,
                "totalFolders", totalFolders
        );

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Change user role", description = "Admin: Change a user's role")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserRole(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID userId,
            @RequestParam Role role) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(mapToResponse(user), "Role updated successfully"));
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Delete user", description = "Admin: Delete a user account")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable UUID userId) {

        // Prevent self-deletion
        if (userPrincipal.getId().equals(userId)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("SELF_DELETE", "Cannot delete your own admin account"));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        userRepository.delete(user);

        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole() != null ? user.getRole() : Role.USER)
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt() : java.time.Instant.now())
                .build();
    }
}

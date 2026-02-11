package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.request.UpdateProfileRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateSettingsRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.UserResponse;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for user management endpoints.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management APIs")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Get the current user's profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@CurrentUser UserPrincipal userPrincipal) {
        UserResponse userResponse = userService.getUserProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Update the current user's profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateProfileRequest request) {

        UserResponse userResponse = userService.updateProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(userResponse, "Profile updated successfully"));
    }

    @PutMapping("/settings")
    @Operation(summary = "Update user settings", description = "Update the current user's settings")
    public ResponseEntity<ApiResponse<UserResponse>> updateSettings(
            @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateSettingsRequest request) {

        UserResponse userResponse = userService.updateSettings(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(userResponse, "Settings updated successfully"));
    }

    @DeleteMapping("/account")
    @Operation(summary = "Delete account", description = "Permanently delete the current user's account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@CurrentUser UserPrincipal userPrincipal) {
        userService.deleteAccount(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
    }
}

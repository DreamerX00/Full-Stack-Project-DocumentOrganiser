package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.request.GoogleAuthRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.LoginRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.RefreshTokenRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.RegisterRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.AuthResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.UserResponse;
import com.alphadocuments.documentorganiserbackend.security.CurrentUser;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.service.AuthService;
import com.alphadocuments.documentorganiserbackend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Register a new user with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {

        AuthResponse authResponse = authService.register(
                request,
                httpRequest.getHeader("User-Agent"),
                getClientIp(httpRequest));

        return ResponseEntity.ok(ApiResponse.success(authResponse, "User registered successfully"));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        AuthResponse authResponse = authService.login(
                request,
                httpRequest.getHeader("User-Agent"),
                getClientIp(httpRequest));

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Login successful"));
    }

    @PostMapping("/google")
    @Operation(summary = "Authenticate with Google", description = "Authenticate user with Google OAuth ID token")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateWithGoogle(
            @Valid @RequestBody GoogleAuthRequest request,
            HttpServletRequest httpRequest) {

        AuthResponse authResponse = authService.authenticateWithGoogle(
                request,
                httpRequest.getHeader("User-Agent"),
                getClientIp(httpRequest));

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Authentication successful"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Get a new access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest) {

        AuthResponse authResponse = authService.refreshToken(
                request,
                httpRequest.getHeader("User-Agent"),
                getClientIp(httpRequest));

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Logout current session")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestBody(required = false) RefreshTokenRequest request) {

        String refreshToken = request != null ? request.getRefreshToken() : null;
        authService.logout(userPrincipal.getId(), refreshToken);

        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @PostMapping("/logout-all")
    @Operation(summary = "Logout from all devices", description = "Logout from all sessions")
    public ResponseEntity<ApiResponse<Void>> logoutAll(@CurrentUser UserPrincipal userPrincipal) {
        authService.logoutAll(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Logged out from all devices"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get the currently authenticated user's profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        UserResponse userResponse = userService.getUserProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(userResponse));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

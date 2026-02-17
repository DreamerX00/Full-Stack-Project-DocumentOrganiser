package com.alphadocuments.documentorganiserbackend.service;

import com.alphadocuments.documentorganiserbackend.dto.request.GoogleAuthRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.LoginRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.RefreshTokenRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.RegisterRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.AuthResponse;

import java.util.UUID;

/**
 * Service interface for authentication operations.
 */
public interface AuthService {

    AuthResponse register(RegisterRequest request, String userAgent, String ipAddress);

    AuthResponse login(LoginRequest request, String userAgent, String ipAddress);

    AuthResponse authenticateWithGoogle(GoogleAuthRequest request, String userAgent, String ipAddress);

    AuthResponse refreshToken(RefreshTokenRequest request, String userAgent, String ipAddress);

    void logout(UUID userId, String refreshToken);

    void logoutAll(UUID userId);
}

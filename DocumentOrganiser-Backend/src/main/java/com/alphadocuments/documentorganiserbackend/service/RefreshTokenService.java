package com.alphadocuments.documentorganiserbackend.service;

import com.alphadocuments.documentorganiserbackend.entity.RefreshToken;

import java.util.UUID;

/**
 * Service interface for refresh token operations.
 */
public interface RefreshTokenService {

    RefreshToken createRefreshToken(UUID userId, String deviceInfo, String ipAddress);

    RefreshToken verifyRefreshToken(String token);

    void revokeRefreshToken(String token);

    void revokeAllUserTokens(UUID userId);

    void deleteExpiredTokens();
}

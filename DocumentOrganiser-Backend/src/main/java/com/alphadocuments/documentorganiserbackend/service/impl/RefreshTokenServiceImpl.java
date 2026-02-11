package com.alphadocuments.documentorganiserbackend.service.impl;

import com.alphadocuments.documentorganiserbackend.config.JwtProperties;
import com.alphadocuments.documentorganiserbackend.entity.RefreshToken;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.exception.InvalidTokenException;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.repository.RefreshTokenRepository;
import com.alphadocuments.documentorganiserbackend.repository.UserRepository;
import com.alphadocuments.documentorganiserbackend.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Implementation of RefreshTokenService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtProperties jwtProperties;

    @Override
    @Transactional
    public RefreshToken createRefreshToken(UUID userId, String deviceInfo, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiresAt(Instant.now().plusMillis(jwtProperties.getRefreshExpiration()))
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if (!refreshToken.isValid()) {
            throw new InvalidTokenException("Refresh token has expired or been revoked");
        }

        return refreshToken;
    }

    @Override
    @Transactional
    public void revokeRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }

    @Override
    @Transactional
    public void revokeAllUserTokens(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 2 * * ?") // Run daily at 2 AM
    public void deleteExpiredTokens() {
        log.info("Deleting expired refresh tokens");
        refreshTokenRepository.deleteExpiredTokens(Instant.now());
    }
}

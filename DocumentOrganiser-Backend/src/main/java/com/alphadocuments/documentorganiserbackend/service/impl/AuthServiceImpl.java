package com.alphadocuments.documentorganiserbackend.service.impl;

import com.alphadocuments.documentorganiserbackend.dto.request.GoogleAuthRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.RefreshTokenRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.AuthResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.UserResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.UserSettingsResponse;
import com.alphadocuments.documentorganiserbackend.entity.RefreshToken;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.entity.UserSettings;
import com.alphadocuments.documentorganiserbackend.entity.enums.AuthProvider;
import com.alphadocuments.documentorganiserbackend.entity.enums.Role;
import com.alphadocuments.documentorganiserbackend.exception.UnauthorizedException;
import com.alphadocuments.documentorganiserbackend.repository.UserRepository;
import com.alphadocuments.documentorganiserbackend.security.jwt.JwtTokenProvider;
import com.alphadocuments.documentorganiserbackend.service.AuthService;
import com.alphadocuments.documentorganiserbackend.service.RefreshTokenService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementation of AuthService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Override
    @Transactional
    public AuthResponse authenticateWithGoogle(GoogleAuthRequest request, String userAgent, String ipAddress) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new UnauthorizedException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            Boolean emailVerified = payload.getEmailVerified();

            // Find or create user
            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
                user.setName(name);
                user.setProfilePicture(pictureUrl);
                user.setEmailVerified(emailVerified);
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                }
                user = userRepository.save(user);
            } else {
                try {
                    user = createNewUser(email, name, pictureUrl, googleId, emailVerified);
                } catch (DataIntegrityViolationException e) {
                    // Race condition: another request created the user concurrently
                    log.warn("Concurrent user creation detected for email {}, fetching existing user", email);
                    user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new UnauthorizedException("User creation failed"));
                    user.setName(name);
                    user.setProfilePicture(pictureUrl);
                    user.setEmailVerified(emailVerified);
                    if (user.getGoogleId() == null) {
                        user.setGoogleId(googleId);
                    }
                    user = userRepository.save(user);
                }
            }

            return generateAuthResponse(user, userAgent, ipAddress);

        } catch (Exception e) {
            log.error("Google authentication failed", e);
            throw new UnauthorizedException("Google authentication failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request, String userAgent, String ipAddress) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.getRefreshToken());
        User user = refreshToken.getUser();

        // Revoke old token
        refreshTokenService.revokeRefreshToken(request.getRefreshToken());

        return generateAuthResponse(user, userAgent, ipAddress);
    }

    @Override
    @Transactional
    public void logout(UUID userId, String refreshToken) {
        if (refreshToken != null) {
            refreshTokenService.revokeRefreshToken(refreshToken);
        }
        log.info("User {} logged out", userId);
    }

    @Override
    @Transactional
    public void logoutAll(UUID userId) {
        refreshTokenService.revokeAllUserTokens(userId);
        log.info("User {} logged out from all devices", userId);
    }

    private User createNewUser(String email, String name, String pictureUrl,
                                String googleId, Boolean emailVerified) {
        User user = User.builder()
                .email(email)
                .name(name)
                .profilePicture(pictureUrl)
                .googleId(googleId)
                .authProvider(AuthProvider.GOOGLE)
                .role(Role.USER)
                .emailVerified(emailVerified != null ? emailVerified : false)
                .enabled(true)
                .storageUsedBytes(0L)
                .build();

        UserSettings settings = UserSettings.builder()
                .user(user)
                .theme("light")
                .language("en")
                .storageLimitMb(100L)
                .notificationsEnabled(true)
                .emailNotificationsEnabled(true)
                .defaultView("grid")
                .sortBy("name")
                .sortOrder("asc")
                .build();

        user.setUserSettings(settings);
        return userRepository.saveAndFlush(user);
    }

    private AuthResponse generateAuthResponse(User user, String userAgent, String ipAddress) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(
                user.getId(), userAgent, ipAddress);

        UserSettingsResponse settingsResponse = null;
        if (user.getUserSettings() != null) {
            UserSettings settings = user.getUserSettings();
            settingsResponse = UserSettingsResponse.builder()
                    .theme(settings.getTheme())
                    .language(settings.getLanguage())
                    .storageLimitMb(settings.getStorageLimitMb())
                    .notificationsEnabled(settings.getNotificationsEnabled())
                    .emailNotificationsEnabled(settings.getEmailNotificationsEnabled())
                    .defaultView(settings.getDefaultView())
                    .sortBy(settings.getSortBy())
                    .sortOrder(settings.getSortOrder())
                    .build();
        }

        long storageLimitBytes = user.getUserSettings() != null
                ? user.getUserSettings().getStorageLimitMb() * 1024 * 1024
                : 100L * 1024 * 1024;

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .emailVerified(user.getEmailVerified())
                .storageUsedBytes(user.getStorageUsedBytes())
                .storageLimitBytes(storageLimitBytes)
                .createdAt(user.getCreatedAt())
                .settings(settingsResponse)
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationMs() / 1000)
                .user(userResponse)
                .build();
    }
}

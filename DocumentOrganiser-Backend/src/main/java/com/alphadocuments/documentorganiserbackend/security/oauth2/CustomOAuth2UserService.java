package com.alphadocuments.documentorganiserbackend.security.oauth2;

import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.entity.UserSettings;
import com.alphadocuments.documentorganiserbackend.entity.enums.AuthProvider;
import com.alphadocuments.documentorganiserbackend.entity.enums.Role;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.repository.UserRepository;
import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

/**
 * Custom OAuth2 user service for processing OAuth2 login.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user", ex);
            throw new OAuth2AuthenticationException("Error processing OAuth2 user");
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String pictureUrl = (String) attributes.get("picture");
        String googleId = (String) attributes.get("sub");
        Boolean emailVerified = (Boolean) attributes.get("email_verified");

        Optional<User> userOptional = userRepository.findByEmail(email);

        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update existing user info
            user.setName(name);
            user.setProfilePicture(pictureUrl);
            user.setEmailVerified(emailVerified);
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
            }
            user = userRepository.save(user);
        } else {
            // Register new user
            user = registerNewUser(email, name, pictureUrl, googleId, emailVerified);
        }

        return UserPrincipal.create(user, attributes);
    }

    private User registerNewUser(String email, String name, String pictureUrl,
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

        // Create default user settings
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

        return userRepository.save(user);
    }
}

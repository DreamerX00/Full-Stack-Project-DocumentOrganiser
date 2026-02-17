package com.alphadocuments.documentorganiserbackend.service.impl;

import com.alphadocuments.documentorganiserbackend.dto.request.UpdateProfileRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateSettingsRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.UserResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.UserSettingsResponse;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.entity.UserSettings;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.repository.UserRepository;
import com.alphadocuments.documentorganiserbackend.repository.UserSettingsRepository;
import com.alphadocuments.documentorganiserbackend.service.UserService;
import com.alphadocuments.documentorganiserbackend.service.FolderService;
import com.alphadocuments.documentorganiserbackend.dto.request.CreateFolderRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Implementation of UserService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final FolderService folderService;

    @Override
    @Transactional(readOnly = true)
    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
    }

    @Override
    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserProfile(UUID userId) {
        User user = userRepository.findByIdWithSettings(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findById(userId);

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }

        user = userRepository.save(user);
        log.info("Updated profile for user: {}", userId);

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateSettings(UUID userId, UpdateSettingsRequest request) {
        User user = userRepository.findByIdWithSettings(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        UserSettings settings = user.getUserSettings();
        if (settings == null) {
            settings = UserSettings.builder().user(user).build();
        }

        if (request.getTheme() != null) {
            settings.setTheme(request.getTheme());
        }
        if (request.getLanguage() != null) {
            settings.setLanguage(request.getLanguage());
        }
        if (request.getNotificationsEnabled() != null) {
            settings.setNotificationsEnabled(request.getNotificationsEnabled());
        }
        if (request.getEmailNotificationsEnabled() != null) {
            settings.setEmailNotificationsEnabled(request.getEmailNotificationsEnabled());
        }
        if (request.getDefaultView() != null) {
            settings.setDefaultView(request.getDefaultView());
        }
        if (request.getSortBy() != null) {
            settings.setSortBy(request.getSortBy());
        }
        if (request.getSortOrder() != null) {
            settings.setSortOrder(request.getSortOrder());
        }
        // Onboarding fields
        if (request.getProfession() != null) {
            settings.setProfession(request.getProfession());
        }
        if (request.getSubcategory() != null) {
            settings.setSubcategory(request.getSubcategory());
        }
        if (request.getSpecialization() != null) {
            settings.setSpecialization(request.getSpecialization());
        }
        if (request.getOnboardingComplete() != null) {
            settings.setOnboardingComplete(request.getOnboardingComplete());
            // If onboarding just completed, create default folders
            if (request.getOnboardingComplete()) {
                createDefaultFoldersForUser(user.getId(), request.getProfession(), request.getSubcategory(), request.getSpecialization());
            }
        }
        user.setUserSettings(settings);
        user = userRepository.save(user);
        log.info("Updated settings for user: {}", userId);
        return mapToUserResponse(user);
    }

    /**
     * Create default folders for user based on onboarding selections.
     */
    private void createDefaultFoldersForUser(UUID userId, String profession, String subcategory, String specialization) {
        List<String> folders = new ArrayList<>();
        if (profession != null) {
            switch (profession) {
                case "Student":
                    folders.add("Assignments");
                    folders.add("Notes");
                    folders.add("Projects");
                    break;
                case "Teacher":
                    folders.add("Lesson Plans");
                    folders.add("Resources");
                    folders.add("Assessments");
                    break;
                case "Doctor":
                    folders.add("Patients");
                    folders.add("Reports");
                    folders.add("Research");
                    break;
                case "Engineer":
                    folders.add("Designs");
                    folders.add("Specs");
                    folders.add("Projects");
                    break;
                case "Lawyer":
                    folders.add("Cases");
                    folders.add("Contracts");
                    folders.add("Research");
                    break;
                case "Business":
                    folders.add("Invoices");
                    folders.add("Clients");
                    folders.add("Reports");
                    break;
                default:
                    folders.add("Documents");
                    folders.add("General");
                    break;
            }
        } else {
            folders.add("Documents");
            folders.add("General");
        }
        if (subcategory != null && !subcategory.equals("General")) {
            folders.add(subcategory);
        }
        if (specialization != null && !specialization.equals("General")) {
            folders.add(specialization);
        }
        for (String folderName : folders) {
            CreateFolderRequest req = CreateFolderRequest.builder()
                .name(folderName)
                .build();
            try {
                folderService.createFolder(userId, req);
            } catch (Exception e) {
                // Ignore if folder already exists or error
            }
        }
    }


    @Override
    @Transactional
    public void deleteAccount(UUID userId) {
        User user = findById(userId);
        userRepository.delete(user);
        log.info("Deleted account for user: {}", userId);
    }

    @Override
    @Transactional
    public void updateStorageUsed(UUID userId, long bytes) {
        User user = findById(userId);
        user.setStorageUsedBytes(user.getStorageUsedBytes() + bytes);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public long getAvailableStorage(UUID userId) {
        User user = userRepository.findByIdWithSettings(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        long limitBytes = user.getUserSettings() != null
                ? user.getUserSettings().getStorageLimitMb() * 1024 * 1024
                : 100L * 1024 * 1024;

        return limitBytes - user.getStorageUsedBytes();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasEnoughStorage(UUID userId, long requiredBytes) {
        return getAvailableStorage(userId) >= requiredBytes;
    }

    private UserResponse mapToUserResponse(User user) {
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
                // Onboarding fields
                .profession(settings.getProfession())
                .subcategory(settings.getSubcategory())
                .specialization(settings.getSpecialization())
                .onboardingComplete(settings.getOnboardingComplete())
                .build();
        }

        long storageLimitBytes = user.getUserSettings() != null
                ? user.getUserSettings().getStorageLimitMb() * 1024 * 1024
                : 100L * 1024 * 1024;

        return UserResponse.builder()
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
    }
    }

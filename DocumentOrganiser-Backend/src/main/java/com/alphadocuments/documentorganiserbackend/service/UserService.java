package com.alphadocuments.documentorganiserbackend.service;

import com.alphadocuments.documentorganiserbackend.dto.request.UpdateProfileRequest;
import com.alphadocuments.documentorganiserbackend.dto.request.UpdateSettingsRequest;
import com.alphadocuments.documentorganiserbackend.dto.response.UserResponse;
import com.alphadocuments.documentorganiserbackend.entity.User;

import java.util.UUID;

/**
 * Service interface for user operations.
 */
public interface UserService {

    User findById(UUID id);

    User findByEmail(String email);

    UserResponse getUserProfile(UUID userId);

    UserResponse updateProfile(UUID userId, UpdateProfileRequest request);

    UserResponse updateSettings(UUID userId, UpdateSettingsRequest request);

    void deleteAccount(UUID userId);

    void updateStorageUsed(UUID userId, long bytes);

    long getAvailableStorage(UUID userId);

    boolean hasEnoughStorage(UUID userId, long requiredBytes);
}

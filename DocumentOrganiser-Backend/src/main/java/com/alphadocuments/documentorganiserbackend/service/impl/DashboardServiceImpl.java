package com.alphadocuments.documentorganiserbackend.service.impl;

import com.alphadocuments.documentorganiserbackend.dto.response.DashboardStatsResponse;
import com.alphadocuments.documentorganiserbackend.dto.response.DocumentResponse;
import com.alphadocuments.documentorganiserbackend.entity.User;
import com.alphadocuments.documentorganiserbackend.entity.enums.DocumentCategory;
import com.alphadocuments.documentorganiserbackend.exception.ResourceNotFoundException;
import com.alphadocuments.documentorganiserbackend.repository.*;
import com.alphadocuments.documentorganiserbackend.service.DashboardService;
import com.alphadocuments.documentorganiserbackend.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Implementation of DashboardService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final FolderRepository folderRepository;
    private final SharedDocumentRepository sharedDocumentRepository;
    private final DocumentService documentService;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(UUID userId) {
        User user = userRepository.findByIdWithSettings(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        long totalDocuments = documentRepository.countByUserIdAndNotDeleted(userId);
        long totalFolders = folderRepository.countByUserIdAndNotDeleted(userId);

        long storageUsedBytes = user.getStorageUsedBytes();
        long storageLimitBytes = user.getUserSettings() != null
                ? user.getUserSettings().getStorageLimitMb() * 1024 * 1024
                : 100L * 1024 * 1024;

        double storageUsedPercentage = storageLimitBytes > 0
                ? (double) storageUsedBytes / storageLimitBytes * 100
                : 0;

        // Get documents by category
        Map<String, Long> documentsByCategory = new HashMap<>();
        List<Object[]> categoryStats = documentRepository.countByCategory(userId);
        for (Object[] stat : categoryStats) {
            DocumentCategory category = (DocumentCategory) stat[0];
            Long count = (Long) stat[1];
            documentsByCategory.put(category.name(), count);
        }

        // Get recent documents
        List<DocumentResponse> recentDocuments = documentService.getRecentDocuments(
                userId, PageRequest.of(0, 5)).getContent();

        // Count favorites
        long favoriteCount = documentRepository.findByUserIdAndIsFavoriteTrueAndIsDeletedFalse(
                userId, PageRequest.of(0, 1)).getTotalElements();

        // Count shared
        long sharedWithMeCount = sharedDocumentRepository.findBySharedWithId(
                userId, PageRequest.of(0, 1)).getTotalElements();
        long sharedByMeCount = sharedDocumentRepository.findBySharedById(
                userId, PageRequest.of(0, 1)).getTotalElements();

        return DashboardStatsResponse.builder()
                .totalDocuments(totalDocuments)
                .totalFolders(totalFolders)
                .storageUsedBytes(storageUsedBytes)
                .storageLimitBytes(storageLimitBytes)
                .storageUsedPercentage(Math.round(storageUsedPercentage * 100.0) / 100.0)
                .favoriteCount(favoriteCount)
                .sharedWithMeCount(sharedWithMeCount)
                .sharedByMeCount(sharedByMeCount)
                .documentsByCategory(documentsByCategory)
                .recentDocuments(recentDocuments)
                .build();
    }
}

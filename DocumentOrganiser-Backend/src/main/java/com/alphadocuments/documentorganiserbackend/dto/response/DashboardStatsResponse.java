package com.alphadocuments.documentorganiserbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for dashboard statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalDocuments;
    private long totalFolders;
    private long storageUsedBytes;
    private long storageLimitBytes;
    private double storageUsedPercentage;
    private long favoriteCount;
    private long sharedWithMeCount;
    private long sharedByMeCount;

    private Map<String, Long> documentsByCategory;
    private List<DocumentResponse> recentDocuments;
    private List<ActivityResponse> recentActivity;
}

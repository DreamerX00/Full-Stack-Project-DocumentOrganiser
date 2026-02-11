package com.alphadocuments.documentorganiserbackend.service;

import com.alphadocuments.documentorganiserbackend.dto.response.DashboardStatsResponse;

import java.util.UUID;

/**
 * Service interface for dashboard operations.
 */
public interface DashboardService {

    DashboardStatsResponse getDashboardStats(UUID userId);
}

package com.alphadocuments.documentorganiserbackend.controller;

import com.alphadocuments.documentorganiserbackend.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Health check controller for API status with detailed component checks.
 */
@Slf4j
@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
@Tag(name = "Health", description = "Health check APIs")
public class HealthController {

    private final DataSource dataSource;
    
    @Autowired(required = false)
    private S3Client s3Client;

    @Value("${storage.bucket-name:document-organiser-dev}")
    private String bucketName;

    @Value("${info.app.version:3.1.6}")
    private String appVersion;

    @GetMapping
    @Operation(summary = "Health check", description = "Check if the API is running")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("timestamp", Instant.now());
        health.put("service", "DocumentOrganiser-Backend");
        health.put("version", appVersion);
        return ResponseEntity.ok(ApiResponse.success(health));
    }

    @GetMapping("/detailed")
    @Operation(summary = "Detailed health check", description = "Check status of all system components")
    public ResponseEntity<ApiResponse<Map<String, Object>>> detailedHealthCheck() {
        Map<String, Object> health = new LinkedHashMap<>();
        Map<String, Object> components = new LinkedHashMap<>();
        boolean allHealthy = true;

        // Database check
        Map<String, Object> dbStatus = checkDatabase();
        components.put("database", dbStatus);
        if (!"UP".equals(dbStatus.get("status"))) {
            allHealthy = false;
        }

        // S3 check
        Map<String, Object> s3Status = checkS3();
        components.put("storage", s3Status);
        if (!"UP".equals(s3Status.get("status"))) {
            allHealthy = false;
        }

        // Memory info
        Runtime runtime = Runtime.getRuntime();
        Map<String, Object> memoryStatus = new LinkedHashMap<>();
        memoryStatus.put("status", "UP");
        memoryStatus.put("maxMemory", formatBytes(runtime.maxMemory()));
        memoryStatus.put("totalMemory", formatBytes(runtime.totalMemory()));
        memoryStatus.put("freeMemory", formatBytes(runtime.freeMemory()));
        memoryStatus.put("usedMemory", formatBytes(runtime.totalMemory() - runtime.freeMemory()));
        components.put("memory", memoryStatus);

        health.put("status", allHealthy ? "UP" : "DEGRADED");
        health.put("timestamp", Instant.now());
        health.put("service", "DocumentOrganiser-Backend");
        health.put("version", appVersion);
        health.put("components", components);

        return ResponseEntity.ok(ApiResponse.success(health));
    }

    private Map<String, Object> checkDatabase() {
        Map<String, Object> status = new LinkedHashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            boolean valid = connection.isValid(5);
            status.put("status", valid ? "UP" : "DOWN");
            status.put("database", connection.getMetaData().getDatabaseProductName());
            status.put("version", connection.getMetaData().getDatabaseProductVersion());
        } catch (Exception e) {
            log.error("Database health check failed", e);
            status.put("status", "DOWN");
            status.put("error", e.getMessage());
        }
        return status;
    }

    private Map<String, Object> checkS3() {
        Map<String, Object> status = new LinkedHashMap<>();
        if (s3Client == null) {
            status.put("status", "UNKNOWN");
            status.put("message", "S3 client not configured");
            return status;
        }
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
            status.put("status", "UP");
            status.put("bucket", bucketName);
        } catch (Exception e) {
            log.error("S3 health check failed", e);
            status.put("status", "DOWN");
            status.put("bucket", bucketName);
            status.put("error", e.getMessage());
        }
        return status;
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char pre = "KMGTPE".charAt(exp - 1);
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}


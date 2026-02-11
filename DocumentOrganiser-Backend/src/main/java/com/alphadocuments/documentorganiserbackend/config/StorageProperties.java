package com.alphadocuments.documentorganiserbackend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for file storage.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {

    private String type = "minio"; // minio or s3
    private String endpoint;
    private String accessKey;
    private String secretKey;
    private String bucketName = "documents";
    private String region = "us-east-1";
    private long defaultQuotaMb = 100; // Default storage quota in MB

    public long getDefaultQuotaBytes() {
        return defaultQuotaMb * 1024 * 1024;
    }
}

package com.alphadocuments.documentorganiserbackend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for request rate limiting.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "rate-limit")
public class RateLimitProperties {

    private boolean enabled = true;
    private Storage storage = Storage.IN_MEMORY;
    private int authLimit = 20;
    private int uploadLimit = 30;
    private int generalLimit = 120;
    private long windowMs = 60_000;
    private long cleanupIntervalMs = 300_000;

    public enum Storage {
        IN_MEMORY,
        DATABASE
    }
}

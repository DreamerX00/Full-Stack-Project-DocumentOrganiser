package com.alphadocuments.documentorganiserbackend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Application URL properties used for redirects and externally-visible links.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String baseUrl = "http://localhost:8080/api/v1";
    private String frontendUrl = "http://localhost:3000";
}

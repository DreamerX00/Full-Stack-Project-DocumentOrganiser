package com.alphadocuments.documentorganiserbackend;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;

import java.util.List;

@TestConfiguration
public class TestSecurityConfig {

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        // Provide an empty in-memory repository for tests to avoid requiring
        // external OAuth2 client configuration during context startup.
        return new InMemoryClientRegistrationRepository(List.of());
    }
}

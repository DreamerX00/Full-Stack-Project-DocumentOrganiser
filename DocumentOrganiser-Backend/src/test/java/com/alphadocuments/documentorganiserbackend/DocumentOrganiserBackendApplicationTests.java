package com.alphadocuments.documentorganiserbackend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

import com.alphadocuments.documentorganiserbackend.TestSecurityConfig;

@SpringBootTest
@Import(TestSecurityConfig.class)
class DocumentOrganiserBackendApplicationTests {

    @MockBean
    private ClientRegistrationRepository clientRegistrationRepository;

    @Test
    void contextLoads() {
    }

}

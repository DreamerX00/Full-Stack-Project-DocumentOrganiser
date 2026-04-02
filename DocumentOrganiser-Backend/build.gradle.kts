plugins {
    java
    id("org.springframework.boot") version "3.5.11"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.alphaDocuments"
version = "3.1.6"
description = "DocumentOrganiser-Backend"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
    all {
        exclude(group = "commons-logging", module = "commons-logging")
    }
}

repositories {
    mavenCentral()
}

// =============================================================================
// Version Management - All versions defined in one place
// =============================================================================
val versions = mapOf(
    "springCloud" to "2025.0.0",
    "jjwt" to "0.13.0",
    "googleApiClient" to "2.8.0",
    "awsSdk" to "2.31.74",
    "tika" to "3.2.3",
    "springdocOpenapi" to "2.8.16",
    "lombok" to "1.18.42",
    "mapstruct" to "1.6.3",
    "logstashEncoder" to "8.0"
)

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:${versions["springCloud"]}")
        mavenBom("software.amazon.awssdk:bom:${versions["awsSdk"]}")
    }
}

dependencies {
    // =========================================================================
    // Spring Boot Starters
    // =========================================================================
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")

    // =========================================================================
    // Database
    // =========================================================================
    runtimeOnly("org.postgresql:postgresql")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")

    // =========================================================================
    // Authentication & JWT
    // =========================================================================
    implementation("io.jsonwebtoken:jjwt-api:${versions["jjwt"]}")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:${versions["jjwt"]}")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:${versions["jjwt"]}")
    implementation("com.google.api-client:google-api-client:${versions["googleApiClient"]}") {
        exclude(group = "commons-logging", module = "commons-logging")
    }

    // =========================================================================
    // AWS S3 / MinIO - File Storage
    // =========================================================================
    implementation("software.amazon.awssdk:s3")
    implementation("software.amazon.awssdk:sts")

    // =========================================================================
    // File Processing
    // =========================================================================
    implementation("org.apache.tika:tika-core:${versions["tika"]}")

    // =========================================================================
    // API Documentation
    // =========================================================================
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:${versions["springdocOpenapi"]}")

    // =========================================================================
    // Code Generation & Utilities
    // =========================================================================
    // Lombok - Reduces boilerplate code
    compileOnly("org.projectlombok:lombok:${versions["lombok"]}")
    annotationProcessor("org.projectlombok:lombok:${versions["lombok"]}")

    // MapStruct - DTO mapping
    implementation("org.mapstruct:mapstruct:${versions["mapstruct"]}")
    annotationProcessor("org.mapstruct:mapstruct-processor:${versions["mapstruct"]}")

    // =========================================================================
    // Logging
    // =========================================================================
    implementation("net.logstash.logback:logstash-logback-encoder:${versions["logstashEncoder"]}")

    // =========================================================================
    // Development Tools
    // =========================================================================
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    developmentOnly("org.springframework.boot:spring-boot-docker-compose")

    // =========================================================================
    // Testing
    // =========================================================================
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("com.h2database:h2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testCompileOnly("org.projectlombok:lombok:${versions["lombok"]}")
    testAnnotationProcessor("org.projectlombok:lombok:${versions["lombok"]}")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.withType<JavaCompile> {
    options.compilerArgs.addAll(listOf(
        "-Amapstruct.defaultComponentModel=spring",
        "-Amapstruct.unmappedTargetPolicy=IGNORE"
    ))
}

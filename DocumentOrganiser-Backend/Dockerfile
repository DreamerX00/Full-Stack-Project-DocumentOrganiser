# ─────────────── BUILD STAGE ───────────────
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# Copy gradle wrapper and build files first (for layer caching)
COPY gradlew gradlew.bat settings.gradle.kts build.gradle.kts ./
COPY gradle/ gradle/

# Download dependencies (cached layer if build files unchanged)
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon -q || true

# Copy source and build the JAR
COPY src/ src/
RUN ./gradlew bootJar --no-daemon -x test

# ─────────────── RUNTIME STAGE ───────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/build/libs/*.jar app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

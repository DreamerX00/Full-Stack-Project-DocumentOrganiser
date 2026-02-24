# -------- RUNTIME STAGE (pre-built JAR) --------
FROM eclipse-temurin:21-jre
WORKDIR /app

RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser

COPY build/libs/*.jar app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

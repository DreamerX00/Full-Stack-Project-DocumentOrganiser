package com.alphadocuments.documentorganiserbackend.config;

import com.alphadocuments.documentorganiserbackend.entity.RateLimitBucket;
import com.alphadocuments.documentorganiserbackend.repository.RateLimitBucketRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiting filter to protect auth and upload endpoints from abuse.
 * <p>
 * Rate limits (per IP):
 * - Auth endpoints (/auth/**): 20 requests per minute
 * - Upload endpoints (POST /documents): 30 requests per minute
 * - All other endpoints: 120 requests per minute
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitProperties rateLimitProperties;
    private final RateLimitBucketRepository rateLimitBucketRepository;
    private final TransactionTemplate transactionTemplate;

    private final Map<String, RateWindow> rateLimitMap = new ConcurrentHashMap<>();
    private volatile long lastCleanup = System.currentTimeMillis();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        if (!rateLimitProperties.isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        String path = getApplicationPath(request);
        String method = request.getMethod();

        int limit = getLimit(path, method);
        String bucketKey = clientIp + ":" + getBucketName(path, method);
        RateLimitStatus status = consume(bucketKey);

        // Set rate limit headers
        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, limit - status.currentCount())));
        response.setHeader("X-RateLimit-Reset", String.valueOf(status.resetEpochSeconds()));

        if (status.currentCount() > limit) {
            log.warn("Rate limit exceeded for IP {} on path {}", clientIp, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Too many requests. Please try again later.\","
                            + "\"error\":{\"code\":\"RATE_LIMIT_EXCEEDED\","
                            + "\"message\":\"Rate limit exceeded. Try again in "
                            + Math.max(1, status.retryAfterSeconds())
                            + " seconds.\"}}"
            );
            return;
        }

        filterChain.doFilter(request, response);

        // Lazily cleanup stale entries
        cleanupStaleEntries();
    }

    private int getLimit(String path, String method) {
        if (path.startsWith("/auth/")) {
            return rateLimitProperties.getAuthLimit();
        }
        if (path.contains("/documents") && "POST".equalsIgnoreCase(method)) {
            return rateLimitProperties.getUploadLimit();
        }
        return rateLimitProperties.getGeneralLimit();
    }

    private String getBucketName(String path, String method) {
        if (path.startsWith("/auth/")) {
            return "auth";
        }
        if (path.contains("/documents") && "POST".equalsIgnoreCase(method)) {
            return "upload";
        }
        return "general";
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private String getApplicationPath(HttpServletRequest request) {
        String contextPath = request.getContextPath();
        String requestUri = request.getRequestURI();
        if (contextPath != null && !contextPath.isEmpty() && requestUri.startsWith(contextPath)) {
            return requestUri.substring(contextPath.length());
        }
        return request.getServletPath();
    }

    private void cleanupStaleEntries() {
        long now = System.currentTimeMillis();
        if (now - lastCleanup < rateLimitProperties.getCleanupIntervalMs()) {
            return;
        }
        lastCleanup = now;
        long staleWindowThreshold = now - rateLimitProperties.getWindowMs() * 2;

        if (rateLimitProperties.getStorage() == RateLimitProperties.Storage.DATABASE) {
            rateLimitBucketRepository.deleteByUpdatedAtBefore(Instant.ofEpochMilli(staleWindowThreshold));
            return;
        }

        rateLimitMap.entrySet().removeIf(entry -> now - entry.getValue().windowStart > rateLimitProperties.getWindowMs() * 2);
    }

    protected RateLimitStatus consume(String bucketKey) {
        long now = Instant.now().toEpochMilli();
        long windowMs = rateLimitProperties.getWindowMs();

        if (rateLimitProperties.getStorage() == RateLimitProperties.Storage.DATABASE) {
            return transactionTemplate.execute(status -> {
                RateLimitBucket bucket = rateLimitBucketRepository.findByBucketKeyForUpdate(bucketKey)
                        .orElseGet(() -> RateLimitBucket.builder()
                                .bucketKey(bucketKey)
                                .windowStart(now)
                                .requestCount(0)
                                .updatedAt(Instant.ofEpochMilli(now))
                                .build());

                if (now - bucket.getWindowStart() > windowMs) {
                    bucket.setWindowStart(now);
                    bucket.setRequestCount(1);
                } else {
                    bucket.setRequestCount(bucket.getRequestCount() + 1);
                }

                bucket.setUpdatedAt(Instant.ofEpochMilli(now));
                RateLimitBucket savedBucket = rateLimitBucketRepository.save(bucket);
                long retryAfterSeconds = Duration.ofMillis(Math.max(0, (savedBucket.getWindowStart() + windowMs) - now))
                        .toSeconds();
                return new RateLimitStatus(
                        savedBucket.getRequestCount(),
                        (savedBucket.getWindowStart() + windowMs) / 1000,
                        Math.max(1, retryAfterSeconds)
                );
            });
        }

        RateWindow window = rateLimitMap.compute(bucketKey, (key, existing) -> {
            if (existing == null || now - existing.windowStart > windowMs) {
                return new RateWindow(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });

        long retryAfterSeconds = Duration.ofMillis(Math.max(0, (window.windowStart + windowMs) - now)).toSeconds();
        return new RateLimitStatus(
                window.count.get(),
                (window.windowStart + windowMs) / 1000,
                Math.max(1, retryAfterSeconds)
        );
    }

    private record RateWindow(long windowStart, AtomicInteger count) {}
    private record RateLimitStatus(int currentCount, long resetEpochSeconds, long retryAfterSeconds) {}
}

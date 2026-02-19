package com.alphadocuments.documentorganiserbackend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-memory rate limiting filter to protect auth and upload endpoints from abuse.
 * <p>
 * Rate limits (per IP):
 * - Auth endpoints (/auth/**): 20 requests per minute
 * - Upload endpoints (POST /documents): 30 requests per minute
 * - All other endpoints: 120 requests per minute
 */
@Slf4j
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int AUTH_LIMIT = 20;
    private static final int UPLOAD_LIMIT = 30;
    private static final int GENERAL_LIMIT = 120;
    private static final long WINDOW_MS = 60_000; // 1 minute

    private final Map<String, RateWindow> rateLimitMap = new ConcurrentHashMap<>();
    private volatile long lastCleanup = System.currentTimeMillis();
    private static final long CLEANUP_INTERVAL_MS = 5 * 60_000; // cleanup every 5 minutes

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        String clientIp = getClientIp(request);
        String path = request.getRequestURI();
        String method = request.getMethod();

        int limit = getLimit(path, method);
        String bucketKey = clientIp + ":" + getBucketName(path, method);

        RateWindow window = rateLimitMap.compute(bucketKey, (key, existing) -> {
            long now = Instant.now().toEpochMilli();
            if (existing == null || now - existing.windowStart > WINDOW_MS) {
                return new RateWindow(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });

        int currentCount = window.count.get();

        // Set rate limit headers
        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, limit - currentCount)));
        response.setHeader("X-RateLimit-Reset", String.valueOf(
                (window.windowStart + WINDOW_MS) / 1000));

        if (currentCount > limit) {
            log.warn("Rate limit exceeded for IP {} on path {}", clientIp, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Too many requests. Please try again later.\","
                            + "\"error\":{\"code\":\"RATE_LIMIT_EXCEEDED\","
                            + "\"message\":\"Rate limit exceeded. Try again in "
                            + Math.max(1, (window.windowStart + WINDOW_MS
                            - Instant.now().toEpochMilli()) / 1000)
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
            return AUTH_LIMIT;
        }
        if (path.contains("/documents") && "POST".equalsIgnoreCase(method)) {
            return UPLOAD_LIMIT;
        }
        return GENERAL_LIMIT;
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

    private void cleanupStaleEntries() {
        long now = System.currentTimeMillis();
        if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
            return;
        }
        lastCleanup = now;
        rateLimitMap.entrySet().removeIf(entry ->
                now - entry.getValue().windowStart > WINDOW_MS * 2);
    }

    private record RateWindow(long windowStart, AtomicInteger count) {}
}

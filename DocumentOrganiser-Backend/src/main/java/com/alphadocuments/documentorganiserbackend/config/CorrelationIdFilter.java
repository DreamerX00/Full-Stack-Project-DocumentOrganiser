package com.alphadocuments.documentorganiserbackend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter that extracts or generates a correlation ID (X-Request-ID) for request tracing.
 * The correlation ID is stored in MDC for structured logging and returned in response headers.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String REQUEST_ID_HEADER = "X-Request-ID";
    public static final String MDC_REQUEST_ID = "requestId";
    public static final String MDC_CLIENT_IP = "clientIp";
    public static final String MDC_USER_AGENT = "userAgent";
    public static final String MDC_REQUEST_PATH = "requestPath";
    public static final String MDC_REQUEST_METHOD = "requestMethod";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        try {
            // Extract or generate request ID
            String requestId = request.getHeader(REQUEST_ID_HEADER);
            if (requestId == null || requestId.isBlank()) {
                requestId = UUID.randomUUID().toString();
            }

            // Store in MDC for logging
            MDC.put(MDC_REQUEST_ID, requestId);
            MDC.put(MDC_CLIENT_IP, getClientIp(request));
            MDC.put(MDC_USER_AGENT, truncate(request.getHeader("User-Agent"), 200));
            MDC.put(MDC_REQUEST_PATH, request.getRequestURI());
            MDC.put(MDC_REQUEST_METHOD, request.getMethod());

            // Set response header for client correlation
            response.setHeader(REQUEST_ID_HEADER, requestId);

            filterChain.doFilter(request, response);
        } finally {
            // Clean up MDC to prevent memory leaks in thread pools
            MDC.remove(MDC_REQUEST_ID);
            MDC.remove(MDC_CLIENT_IP);
            MDC.remove(MDC_USER_AGENT);
            MDC.remove(MDC_REQUEST_PATH);
            MDC.remove(MDC_REQUEST_METHOD);
        }
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

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return "-";
        }
        return value.length() > maxLength ? value.substring(0, maxLength) + "..." : value;
    }
}

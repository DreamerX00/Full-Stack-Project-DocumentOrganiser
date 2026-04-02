package com.alphadocuments.documentorganiserbackend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter to add security headers to all responses.
 * Implements CSP, X-Frame-Options, and other security best practices.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // Prevent clickjacking
        response.setHeader("X-Frame-Options", "DENY");
        
        // Prevent MIME type sniffing
        response.setHeader("X-Content-Type-Options", "nosniff");
        
        // Enable XSS filter
        response.setHeader("X-XSS-Protection", "1; mode=block");
        
        // Referrer policy - don't leak information
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        
        // Permissions policy - restrict features
        response.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
        
        // Content Security Policy for API responses
        // Allows loading resources from self and the frontend URL
        String csp = String.format(
                "default-src 'self'; " +
                "script-src 'self'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self'; " +
                "connect-src 'self' %s; " +
                "frame-ancestors 'none'; " +
                "form-action 'self'; " +
                "base-uri 'self';",
                frontendUrl
        );
        response.setHeader("Content-Security-Policy", csp);
        
        // Strict Transport Security (HSTS) - force HTTPS
        // Will be effective when served over HTTPS
        response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        
        filterChain.doFilter(request, response);
    }
}

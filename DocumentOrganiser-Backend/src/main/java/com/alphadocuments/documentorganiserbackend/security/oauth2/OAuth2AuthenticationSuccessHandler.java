package com.alphadocuments.documentorganiserbackend.security.oauth2;

import com.alphadocuments.documentorganiserbackend.security.UserPrincipal;
import com.alphadocuments.documentorganiserbackend.security.jwt.JwtTokenProvider;
import com.alphadocuments.documentorganiserbackend.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * OAuth2 authentication success handler.
 * Tokens are passed via short-lived httpOnly cookies instead of URL query
 * parameters to prevent leaks through browser history, referrer headers,
 * and server logs.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;

    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String frontendUrl;

    /** Cookie max-age in seconds — just long enough for the redirect round-trip. */
    private static final int COOKIE_MAX_AGE_SECONDS = 120;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        if (response.isCommitted()) {
            log.debug("Response has already been committed");
            return;
        }

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = refreshTokenService.createRefreshToken(
                userPrincipal.getId(),
                request.getHeader("User-Agent"),
                getClientIp(request)
        ).getToken();

        // Set tokens in short-lived httpOnly cookies — never in URL params
        addTokenCookie(response, "oauth2_access_token", accessToken);
        addTokenCookie(response, "oauth2_refresh_token", refreshToken);

        // Redirect to a clean URL with no sensitive data
        String targetUrl = frontendUrl + "/oauth2/callback";
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private void addTokenCookie(HttpServletResponse response, String name, String value) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(COOKIE_MAX_AGE_SECONDS);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

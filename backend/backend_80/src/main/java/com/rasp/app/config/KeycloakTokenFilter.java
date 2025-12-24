package com.rasp.app.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Component
public class KeycloakTokenFilter extends OncePerRequestFilter {

    @Value("${spring.security.oauth2.client.provider.keycloak.token-uri}")
    private String REFRESH_URL;

    @Value("${spring.security.oauth2.client.provider.keycloak.INTROSPECT_URL}")
    private String INTROSPECT_URL;

    @Value("${spring.security.oauth2.client.provider.keycloak.clientId}")
    private String CLIENT_ID;

    @Value("${spring.security.oauth2.client.provider.keycloak.clientSecret}")
    private String CLIENT_SECRET;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // ✅ Public endpoints (no token check)
        if (isPublicEndpoint(path)) {
            chain.doFilter(request, response);
            return;
        }

        // ✅ Extract access token
        String accessToken = extractAccessToken(request);
        if (accessToken == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing access token");
            return;
        }

        boolean accessValid = isTokenValid(accessToken);

        // ✅ If access token is invalid → try refresh
        if (!accessValid) {
            String refreshToken = extractRefreshToken(request);

            if (refreshToken == null || !isTokenValid(refreshToken)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired tokens");
                return;
            }

            String[] tokens = refreshAccessToken(refreshToken);
            if (tokens == null || tokens[0] == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Failed to refresh access token");
                return;
            }

            String newAccessToken = tokens[0];
            String newRefreshToken = tokens[1];

            setCookie(response, "access_token", newAccessToken, -1);
            setCookie(response, "refresh_token", newRefreshToken, -1);

            // ✅ Wrap request with updated Authorization header
            HttpServletRequest modifiedRequest = new HttpServletRequestWrapper(request) {
                @Override
                public String getHeader(String name) {
                    if ("Authorization".equalsIgnoreCase(name)) {
                        return "Bearer " + newAccessToken;
                    }
                    return super.getHeader(name);
                }
            };

            setAuthentication(modifiedRequest);
            chain.doFilter(modifiedRequest, response);
            return;
        }

        // ✅ Access token valid — proceed
        setAuthentication(request);
        chain.doFilter(request, response);
    }

    // --------------------------
    // 🔹 TOKEN VALIDATION LOGIC
    // --------------------------
    private boolean isTokenValid(String token) {
        if (token == null || token.isEmpty()) {
            System.out.println("Token is null or empty");
            return false;
        }

        try {
            // First, try to parse the token locally to check expiration
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                System.out.println("Invalid token format");
                return false;
            }

            // Decode the payload (middle part of JWT)
            String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
            JsonNode payload = objectMapper.readTree(payloadJson);

            // Check expiration
            if (payload.has("exp")) {
                long expiresAt = payload.get("exp").asLong() * 1000;
                long now = System.currentTimeMillis();
                long timeLeft = expiresAt - now;

                System.out.println("Token expires in: " + (timeLeft / 1000) + " seconds");

                // If token is already expired
                if (timeLeft <= 0) {
                    System.out.println("Token has expired");
                    return false;
                }

                // If token is about to expire soon (less than 30 seconds)
                if (timeLeft < 30000) {
                    System.out.println("Token will expire soon, forcing refresh");
                    return false;
                }
            }

            // If we got here, the token is not expired and not about to expire
            // Now verify the token with Keycloak
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(CLIENT_ID, CLIENT_SECRET);

            String body = "token=" + token;
            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            System.out.println("Validating token with Keycloak...");
            ResponseEntity<String> response = restTemplate.exchange(
                    INTROSPECT_URL,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode() != HttpStatus.OK) {
                System.out.println("Keycloak validation failed with status: " + response.getStatusCode());
                return false;
            }

            JsonNode json = objectMapper.readTree(response.getBody());
            boolean active = json.has("active") && json.get("active").asBoolean();
            System.out.println("Keycloak token validation result: " + (active ? "active" : "inactive"));

            return active;

        } catch (Exception e) {
            System.out.println("Token validation error: " + e.getMessage());
            return false;
        }
    }

    // --------------------------
    // 🔹 REFRESH ACCESS TOKEN
    // --------------------------
    private String[] refreshAccessToken(String refreshToken) {
        try {
            System.out.println("Attempting to refresh token...");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            String body = "grant_type=refresh_token" +
                    "&refresh_token=" + refreshToken +
                    "&client_id=" + CLIENT_ID +
                    "&client_secret=" + CLIENT_SECRET;

            HttpEntity<String> requestEntity = new HttpEntity<>(body, headers);

            System.out.println("Sending token refresh request to: " + REFRESH_URL);
            ResponseEntity<String> response = restTemplate.exchange(
                    REFRESH_URL,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode() != HttpStatus.OK) {
                System.out.println("Token refresh failed with status: " + response.getStatusCode());
                System.out.println("Response: " + response.getBody());
                return null;
            }

            JsonNode json = objectMapper.readTree(response.getBody());
            if (!json.has("access_token")) {
                System.out.println("No access_token in refresh response");
                return null;
            }

            // Get the new tokens
            String newAccessToken = json.get("access_token").asText();
            String newRefreshToken = json.has("refresh_token") ?
                    json.get("refresh_token").asText() : refreshToken; // Use new refresh token if provided, else keep the old one

            System.out.println("Successfully refreshed tokens");
            System.out.println("New access token: " + newAccessToken.substring(0, 20) + "...");
            if (newRefreshToken != null && !newRefreshToken.equals(refreshToken)) {
                System.out.println("Received new refresh token");
            }

            return new String[]{newAccessToken, newRefreshToken};

        } catch (Exception e) {
            System.out.println("Error refreshing token: " + e.getMessage());
            return null;
        }
    }

    // --------------------------
    // 🔹 AUTHENTICATION CONTEXT
    // --------------------------
    private void setAuthentication(HttpServletRequest request) {
        UserDetails userDetails = new User("user", "", Collections.emptyList());
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    // --------------------------
    // 🔹 TOKEN EXTRACTION HELPERS
    // --------------------------
    private String extractAccessToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }

        // fallback — if access_token is in cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String extractRefreshToken(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if ("refresh_token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void setCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true); // prevents JavaScript access
        cookie.setSecure(false);  // set true in HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }

    // --------------------------
    // 🔹 PUBLIC ENDPOINTS
    // --------------------------
    private boolean isPublicEndpoint(String path) {
        return (
                path.equals("/api/auth/login") ||
                        path.equals("/api/auth/register") ||
                        path.equals("/api/auth/callback") ||
                        path.equals("/api/auth/logout") ||
                        path.equals("/api/auth/add-client-role") ||
                        path.equals("/api/auth/assign-client-role") ||
                        path.equals("/api/auth/user_resource_role") ||
                        path.equals("/api/v1/role_resource") ||
                        path.equals("/api/role_resource_permission") ||
                        path.equals("/api/auth/add_user") ||
                        path.equals("/api/generateApp") ||
                        path.equals("/api/resource_role") ||
                        path.equals("/api/auth/user_role_mapping") ||
                        path.equals("/api/getAllResourceMetaData") ||
                        path.equals("/api/GetAllResource") ||
                        path.startsWith("/api/getAllResourceMetaData/") ||
                        path.startsWith("/api/auth/role") ||
                        path.startsWith("/api/role_user_res_instance") ||
                        (path.startsWith("/api/auth/") && path.endsWith("/users")) ||
                        path.startsWith("/api/auth/users-with-roles") ||
                        path.startsWith("/api/auth/update-user") ||
                        path.equals("/api/auth/addUser")||
                        path.startsWith("/api/generate_app_zip")

        );
    }
}

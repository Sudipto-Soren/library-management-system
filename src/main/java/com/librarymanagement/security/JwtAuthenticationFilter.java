package com.librarymanagement.security;

import com.librarymanagement.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT authentication filter that intercepts every HTTP request to validate
 * Bearer tokens from the Authorization header.
 * <p>
 * Extracts the JWT, validates it, loads the associated user, and sets the
 * authentication in the SecurityContext for downstream authorization checks.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Extract the Authorization header
        final String authHeader = request.getHeader(AUTHORIZATION_HEADER);

        // 2. If the header is missing or doesn't start with "Bearer ", skip JWT processing
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 3. Extract the token (everything after "Bearer ")
            final String jwt = authHeader.substring(BEARER_PREFIX.length());

            // 4. Extract username (email) from the token
            final String username = jwtUtil.extractUsername(jwt);

            // 5. If username is present and no authentication exists in the context
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Load the user details from the database
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

                // Validate the token against the loaded user
                if (jwtUtil.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set the authentication in the SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Authenticated user '{}' via JWT", username);
                }
            }
        } catch (Exception e) {
            // Log the error but do not block the request — let Spring Security handle unauthorized access
            log.error("JWT authentication failed: {}", e.getMessage());
        }

        // 6. Continue the filter chain regardless of authentication outcome
        filterChain.doFilter(request, response);
    }
}

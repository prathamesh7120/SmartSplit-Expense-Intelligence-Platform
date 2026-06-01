package com.smartsplit.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

// OncePerRequestFilter = runs exactly once per HTTP request.
// Not twice, not zero times. Once. Every request goes through this.
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Step 1: Read the Authorization header from the incoming request.
        // Every protected request from React frontend will have:
        // Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
        final String authHeader = request.getHeader("Authorization");

        // Step 2: If there is no Authorization header,
        // OR it does not start with "Bearer " —
        // this request has no JWT token.
        // Let it continue to the next filter.
        // Spring Security will then reject it as unauthenticated
        // if the endpoint requires authentication.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return; // stop processing here
        }

        // Step 3: Extract the token by removing "Bearer " prefix (7 characters).
        // authHeader = "Bearer eyJhbG..."
        // jwt       = "eyJhbG..."
        final String jwt = authHeader.substring(7);

        // Step 4: Extract the email from inside the JWT token.
        // JwtUtil decodes the token and reads the "subject" field
        // which we set to email during token generation.
        final String email = jwtUtil.extractEmail(jwt);

        // Step 5: If email was extracted successfully AND
        // the user is not already authenticated in this request —
        // (SecurityContextHolder.getContext().getAuthentication() == null
        //  means "no one is authenticated yet in this request")
        if (email != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            // Step 6: Load the full User object from the database using email.
            // We need the full UserDetails to validate the token properly.
            UserDetails userDetails =
                    userDetailsService.loadUserByUsername(email);

            // Step 7: Ask JwtUtil to verify:
            // a) Does the email in token match this user's email?
            // b) Is the token not expired yet?
            // Both must be true.
            if (jwtUtil.isTokenValid(jwt, userDetails)) {

                // Step 8: Create an Authentication object.
                // This is Spring Security's internal representation
                // of "this user is authenticated."
                // First argument: who is authenticated (UserDetails)
                // Second argument: credentials (null — we use JWT, no password here)
                // Third argument: their authorities/roles (empty list for now)
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                // Step 9: Add request details to the auth token
                // (IP address, session ID etc.) for auditing purposes.
                authToken.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                // Step 10: Store the Authentication in SecurityContextHolder.
                // This is the KEY step. By setting this, you tell Spring Security:
                // "This request is authenticated. Allow it through."
                // Every security check downstream reads from SecurityContextHolder.
                SecurityContextHolder.getContext()
                        .setAuthentication(authToken);
            }
        }

        // Step 11: Continue to the next filter in the chain.
        // If authentication was set above, the request reaches the controller.
        // If authentication was NOT set, Spring Security blocks it with 403.
        filterChain.doFilter(request, response);
    }
}

package com.smartsplit.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // This is the bean AuthService was asking for.
    // @Bean tells Spring: "create one instance of this
    // and keep it ready for anyone who needs it."
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt is a one-way hashing algorithm.
        // "password123" → "$2a$10$xyz..." — cannot be reversed.
        // Strength 10 means it runs 2^10 = 1024 hashing rounds.
        // Slower hashing = harder for attackers to brute force.
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        // Spring Security's built-in manager.
        // We will use this later in the Login API
        // to verify username + password combination.
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {
        http
                // Disable CSRF — not needed for REST APIs.
                // CSRF protects browser form submissions.
                // Our React frontend uses JSON + JWT, not form cookies.
                .csrf(AbstractHttpConfigurer::disable)

                // Define which endpoints are public vs protected.
                .authorizeHttpRequests(auth -> auth
                        // /api/auth/register and /api/auth/login
                        // must be public — user is not logged in yet.
                        .requestMatchers("/api/auth/**").permitAll()
                        // Every other endpoint requires a valid JWT token.
                        .anyRequest().authenticated()
                )

                // STATELESS = do not create HTTP sessions.
                // Each request must carry its own JWT token.
                // This is what makes your API scalable.
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }
}

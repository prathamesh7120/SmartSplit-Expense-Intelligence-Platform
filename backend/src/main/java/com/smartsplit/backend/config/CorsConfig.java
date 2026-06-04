package com.smartsplit.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Which frontend origins are allowed to call this backend.
        // localhost:5173 = your React dev server.
        // Add your Vercel URL here before deployment.
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://smart-split-expense-intelligence-pl.vercel.app"
        ));

        // Which HTTP methods are allowed.
        // Must include OPTIONS — browsers send OPTIONS first
        // as a "preflight" check before the real request.
        // If OPTIONS is blocked, ALL requests fail with CORS error.
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE",
                "PATCH", "OPTIONS"
        ));

        // Which headers the frontend is allowed to send.
        // Authorization = your JWT token header.
        // Content-Type = tells backend the body is JSON.
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin"
        ));

        // Allow the browser to read response headers.
        // Needed for some auth flows.
        config.setAllowCredentials(true);

        // How long the browser caches preflight response (seconds).
        // 3600 = 1 hour. Browser won't send OPTIONS again for 1 hour.
        // Reduces unnecessary preflight requests.
        config.setMaxAge(3600L);

        // Apply this config to ALL endpoints /**
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}

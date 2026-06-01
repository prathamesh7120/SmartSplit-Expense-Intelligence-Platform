package com.smartsplit.backend.service;

import com.smartsplit.backend.dto.request.RegisterRequest;
import com.smartsplit.backend.dto.response.AuthResponse;
import com.smartsplit.backend.model.User;
import com.smartsplit.backend.repository.UserRepository;
import com.smartsplit.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {

        // Step 1: Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Step 2: Build the User entity. NEVER store raw password.
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        // Step 3: Save to database
        userRepository.save(user);

        // Step 4: Generate JWT token for auto-login after register
        String token = jwtUtil.generateToken(user.getEmail());

        // Step 5: Return response DTO
        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .message("Registration successful")
                .build();
    }
}

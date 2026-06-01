package com.smartsplit.backend.service;

import com.smartsplit.backend.dto.request.RegisterRequest;
import com.smartsplit.backend.dto.response.AuthResponse;
import com.smartsplit.backend.model.User;
import com.smartsplit.backend.repository.UserRepository;
import com.smartsplit.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.smartsplit.backend.dto.request.LoginRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

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

    public AuthResponse login(LoginRequest request) {

        // authenticate() does two things automatically:
        // 1. Calls UserDetailsServiceImpl.loadUserByUsername(email)
        //    to fetch the user from database
        // 2. Uses BCrypt to compare request.getPassword() with stored hash
        // If either fails → throws BadCredentialsException automatically
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),    // principal (who)
                            request.getPassword()  // credentials (proof)
                    )
            );
        } catch (BadCredentialsException e) {
            // Wrong password — throw our own message
            // GlobalExceptionHandler will catch this RuntimeException
            throw new RuntimeException("Invalid email or password");
        }

        // If we reach here, authentication succeeded.
        // Load the user to get their details for the response.
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate a fresh JWT token for this login session
        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .message("Login successful")
                .build();
    }


}

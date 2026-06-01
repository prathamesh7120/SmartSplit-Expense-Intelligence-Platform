package com.smartsplit.backend.controller;

import com.smartsplit.backend.dto.request.RegisterRequest;
import com.smartsplit.backend.dto.response.AuthResponse;
import com.smartsplit.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.smartsplit.backend.dto.request.LoginRequest;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        // Controller has ONE job: receive request, call service, return response.
        // All logic is in AuthService.login()
        return ResponseEntity.ok(authService.login(request));
    }
}

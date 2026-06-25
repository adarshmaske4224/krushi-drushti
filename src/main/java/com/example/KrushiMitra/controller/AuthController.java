package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.dto.AuthResponse;
import com.example.KrushiMitra.dto.LoginRequest;
import com.example.KrushiMitra.dto.RegisterRequest;
import com.example.KrushiMitra.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("POST /api/auth/register — email: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        log.info("Registration successful — email: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /api/auth/login — email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        log.info("Login successful — email: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }
}
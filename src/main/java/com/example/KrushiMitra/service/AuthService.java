package com.example.KrushiMitra.service;


import com.example.KrushiMitra.dto.AuthResponse;
import com.example.KrushiMitra.dto.LoginRequest;
import com.example.KrushiMitra.dto.RegisterRequest;
import com.example.KrushiMitra.entity.User;
import com.example.KrushiMitra.exception.ResourceNotFoundException;
import com.example.KrushiMitra.repository.UserRepository;

import com.example.KrushiMitra.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed — email already registered: {}", request.getEmail());
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .state(request.getState())
                .district(request.getDistrict())
                .village(request.getVillage())
                .landSizeAcres(request.getLandSizeAcres())
                .primaryCrop(request.getPrimaryCrop())
                .category(request.getCategory())
                .annualIncome(request.getAnnualIncome())
                .preferredLanguage(request.getPreferredLanguage())
                .role(User.Role.FARMER)
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {} ({})", user.getFullName(), user.getEmail());

        String token = jwtUtil.generateToken(user.getEmail());
        log.debug("JWT token generated for new user: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .preferredLanguage(user.getPreferredLanguage())
                .state(user.getState())
                .district(user.getDistrict())
                .village(user.getVillage())
                .primaryCrop(user.getPrimaryCrop())
                .landSizeAcres(user.getLandSizeAcres())
                .annualIncome(user.getAnnualIncome())
                .category(user.getCategory())
                .phone(user.getPhone())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        log.debug("Authentication successful for: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.error("User not found after authentication: {}", request.getEmail());
                    return new ResourceNotFoundException("User not found");
                });

        String token = jwtUtil.generateToken(user.getEmail());
        log.info("Login successful for user: {} ({})", user.getFullName(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .preferredLanguage(user.getPreferredLanguage())
                .state(user.getState())
                .district(user.getDistrict())
                .village(user.getVillage())
                .primaryCrop(user.getPrimaryCrop())
                .landSizeAcres(user.getLandSizeAcres())
                .annualIncome(user.getAnnualIncome())
                .category(user.getCategory())
                .phone(user.getPhone())

                .build();
    }
}
package com.example.KrushiMitra.dto;

import lombok.*;

@Data @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private String role;
    private String preferredLanguage;
    // ✅ Add all these missing fields
    private String state;
    private String district;
    private String village;
    private String primaryCrop;
    private Double landSizeAcres;
    private Double annualIncome;
    private String category;
    private String phone;

}
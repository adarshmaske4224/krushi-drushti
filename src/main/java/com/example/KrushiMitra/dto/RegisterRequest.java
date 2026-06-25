package com.example.KrushiMitra.dto;

import jakarta.validation.constraints.*;
import lombok.Data;


@Data
public class RegisterRequest {
    @NotBlank private String fullName;
    @Email @NotBlank private String email;
    @NotBlank @Size(min = 6) private String password;
    private String phone;
    @NotBlank private String state;
    @NotBlank private String district;
    private String village;
    @NotNull
    @Positive private Double landSizeAcres;
    private String primaryCrop;
    private String category;
    private Double annualIncome;
    private String preferredLanguage = "en";
}
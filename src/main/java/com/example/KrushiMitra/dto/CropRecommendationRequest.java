package com.example.KrushiMitra.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropRecommendationRequest {
    private String district;
    private String month;
    private String irrigation;
    private String soilType;
}

package com.example.KrushiMitra.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropRecommendationResponse {

    private String district;
    private List<CropRecommendationDTO> recommendations;
}

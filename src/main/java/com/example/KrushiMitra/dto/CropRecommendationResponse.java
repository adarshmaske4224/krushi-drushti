package com.example.KrushiMitra.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropRecommendationResponse {

    private String district;
    private String season;
    private List<CropRecommendationDTO> recommendations;
}

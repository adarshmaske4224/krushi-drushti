package com.example.KrushiMitra.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropRecommendationResponse {

    private String district;
    private String season;
    private Map<String, List<CropRecommendationDTO>> recommendations;
}

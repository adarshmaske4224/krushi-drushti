package com.example.KrushiMitra.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropRecommendationDTO {

    private String crop;
    private int score;
    private double expectedProfit;

    // Detailed breakdown
    private String season;
    private String soilType;
    private String waterRequirement;
    private Integer growthDays;
    private String category;
    private List<ScoreBreakdownDTO> scoreBreakdown;
}

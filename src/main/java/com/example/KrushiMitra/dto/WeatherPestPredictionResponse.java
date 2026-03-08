package com.example.KrushiMitra.dto;

import lombok.Data;
import lombok.Builder;

import java.util.List;

@Data
public class WeatherPestPredictionResponse {

    private String overallRiskLevel;
    private String generalAdvice;
    private List<PestPrediction> predictions;

    @Data
    @Builder
    public static class PestPrediction {

        private String pestName;
        private String riskLevel;
        private String reason;
        private String preventiveMeasure;
    }
}
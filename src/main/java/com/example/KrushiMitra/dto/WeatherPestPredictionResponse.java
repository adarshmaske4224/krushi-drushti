package com.example.KrushiMitra.dto;

import lombok.Data;
import lombok.Builder;

import java.util.List;

@Data
public class WeatherPestPredictionResponse {

    private String overallRiskLevel;
    private String generalAdvice;
    private List<PestPrediction> predictions;

    private Double temperature;
    private Double humidity;
    private Double rainfall;
    private Double windSpeed;
    private String weatherCondition;
    private String season;

    @Data
    @Builder
    public static class PestPrediction {

        private String pestName;
        private String riskLevel;
        private String reason;
        private String preventiveMeasure;
    }
}
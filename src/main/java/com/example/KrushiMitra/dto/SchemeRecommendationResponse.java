package com.example.KrushiMitra.dto;

import lombok.*;
import java.util.List;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class SchemeRecommendationResponse {
    private Long schemeId;
    private String schemeName;
    private String description;
    private String benefits;
    private String applicationUrl;
    private String aiReasoning;
    private String status;
    private String statusNote;

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class ListResponse {
        private List<SchemeRecommendationResponse> recommendations;
        private int totalEligible;
    }
}
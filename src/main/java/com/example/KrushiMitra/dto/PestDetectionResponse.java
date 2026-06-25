package com.example.KrushiMitra.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PestDetectionResponse {
    private Long reportId;
    private String pestName;
    private Double confidencePercent;
    private String treatmentRecommendation;
    private String districtAlert;  // filled if regional alert triggered
}
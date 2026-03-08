package com.example.KrushiMitra.dto;

import lombok.*;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WeatherData {
    private String location;
    private String district;
    private String state;
    private Double temperature;
    private Double humidity;
    private Double rainfall;
    private Double windSpeed;
    private String weatherCondition;
    private String season;
}
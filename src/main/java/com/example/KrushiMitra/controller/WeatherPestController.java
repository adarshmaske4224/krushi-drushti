package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.dto.WeatherPestPredictionResponse;
import com.example.KrushiMitra.service.WeatherPestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherPestController {

    private final WeatherPestService weatherPestService;

    @GetMapping("/pest-prediction")
    public WeatherPestPredictionResponse predictPests(
            @RequestParam(name = "district", required = false) String district,
            @RequestParam(name = "state", required = false) String state,
            @RequestParam(name = "cropType", required = false) String cropType
    ) throws Exception {
        log.info("GET /api/weather/pest-prediction — district: {}, state: {}, cropType: {}", district, state, cropType);
        WeatherPestPredictionResponse response = weatherPestService.predictPests(district, state, cropType);
        log.info("Pest prediction returned — risk: {}, condition: {}", response.getOverallRiskLevel(), response.getWeatherCondition());
        return response;
    }
}
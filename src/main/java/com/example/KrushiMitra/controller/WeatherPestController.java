package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.dto.WeatherPestPredictionResponse;
import com.example.KrushiMitra.service.WeatherPestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherPestController {

    private final WeatherPestService weatherPestService;

    @GetMapping("/pest-prediction")
    public WeatherPestPredictionResponse predictPests(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String cropType
    ) throws Exception {

        return weatherPestService.predictPests(district, state, cropType);
    }
}
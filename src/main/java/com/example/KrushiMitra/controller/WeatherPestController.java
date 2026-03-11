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
            @RequestParam(name = "district", required = false) String district,
            @RequestParam(name = "state", required = false) String state,
            @RequestParam(name = "cropType", required = false) String cropType
    ) throws Exception {

        return weatherPestService.predictPests(district, state, cropType);
    }
}
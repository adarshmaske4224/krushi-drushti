package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.dto.SchemeRecommendationResponse;
import com.example.KrushiMitra.entity.Scheme;
import com.example.KrushiMitra.service.SchemeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/schemes")
@RequiredArgsConstructor
public class SchemeController {

    private final SchemeService schemeService;

    @GetMapping("/recommendations")
    public ResponseEntity<List<SchemeRecommendationResponse>> getRecommendations() throws Exception {
        log.info("GET /api/schemes/recommendations");
        List<SchemeRecommendationResponse> recommendations = schemeService.getRecommendations().getRecommendations();
        log.info("Scheme recommendations returned — count: {}", recommendations.size());
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Scheme>> getAllSchemes() {
        log.info("GET /api/schemes/all");
        List<Scheme> schemes = schemeService.getAllSchemes();
        log.info("All schemes returned — count: {}", schemes.size());
        return ResponseEntity.ok(schemes);
    }
}
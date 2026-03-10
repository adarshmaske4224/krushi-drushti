package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.dto.SchemeRecommendationResponse;
import com.example.KrushiMitra.entity.Scheme;
import com.example.KrushiMitra.service.SchemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schemes")
@RequiredArgsConstructor
public class SchemeController {

    private final SchemeService schemeService;

    @GetMapping("/recommendations")
    public ResponseEntity<List<SchemeRecommendationResponse>> getRecommendations() throws Exception {
        return ResponseEntity.ok(schemeService.getRecommendations().getRecommendations());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Scheme>> getAllSchemes() {
        return ResponseEntity.ok(schemeService.getAllSchemes());
    }
}
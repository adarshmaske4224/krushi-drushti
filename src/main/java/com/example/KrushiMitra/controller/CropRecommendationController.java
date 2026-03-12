package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.dto.CropRecommendationResponse;
import com.example.KrushiMitra.service.CropRecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/crops")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CropRecommendationController {

    private final CropRecommendationService cropRecommendationService;

    /**
     * GET /api/crops/recommend?district={districtName}
     *
     * Returns the top 5 recommended crops for the specified district.
     */
    @GetMapping("/recommend")
    public ResponseEntity<CropRecommendationResponse> getRecommendations(
            @RequestParam("district") String districtName) {

        log.info("GET /api/crops/recommend — district: {}", districtName);
        CropRecommendationResponse response =
                cropRecommendationService.getRecommendations(districtName);
        log.info("Crop recommendations returned — district: {}, count: {}", districtName, response.getRecommendations().size());

        return ResponseEntity.ok(response);
    }
}

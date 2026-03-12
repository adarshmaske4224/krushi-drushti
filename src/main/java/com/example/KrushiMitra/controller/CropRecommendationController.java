package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.dto.CropRecommendationRequest;
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
     * POST /api/crops/recommend
     *
     * Returns the top 5 recommended crops for the specified parameters.
     */
    @PostMapping("/recommend")
    public ResponseEntity<CropRecommendationResponse> getRecommendations(
            @RequestBody CropRecommendationRequest request) {

        log.info("POST /api/crops/recommend — district: {}, month: {}", 
                request.getDistrict(), request.getMonth());
        CropRecommendationResponse response =
                cropRecommendationService.getRecommendations(request);
        log.info("Crop recommendations returned — district: {}, count: {}", 
                request.getDistrict(), response.getRecommendations().size());

        return ResponseEntity.ok(response);
    }
}

package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.dto.CropPriceResponse;
import com.example.KrushiMitra.service.CropPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prices")
@RequiredArgsConstructor
public class CropPriceController {

    private final CropPriceService cropPriceService;

    @GetMapping
    public ResponseEntity<CropPriceResponse> getPrice(
            @RequestParam String commodity,
            @RequestParam String state,
            @RequestParam String market,
            @RequestParam (required = false, defaultValue = "") String district) {
        return ResponseEntity.ok(cropPriceService.getCurrentPrice(commodity, state, market, district));
    }
}
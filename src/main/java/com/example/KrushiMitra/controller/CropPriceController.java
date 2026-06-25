package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.dto.CropPriceResponse;
import com.example.KrushiMitra.service.CropPriceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
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
        log.info("GET /api/prices — commodity: {}, state: {}, market: {}, district: {}", commodity, state, market, district);
        CropPriceResponse response = cropPriceService.getCurrentPrice(commodity, state, market, district);
        log.info("Price response — commodity: {}, modalPrice: {}", response.getCommodity(), response.getModalPrice());
        return ResponseEntity.ok(response);
    }
}
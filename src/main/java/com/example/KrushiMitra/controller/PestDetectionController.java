package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.dto.PestDetectionResponse;


import com.example.KrushiMitra.entity.PestReport;
import com.example.KrushiMitra.repository.UserRepository;
import com.example.KrushiMitra.service.PestDetectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/pest")
@RequiredArgsConstructor
public class PestDetectionController {

    private final PestDetectionService pestDetectionService;
    private final UserRepository userRepository;

    @PostMapping("/detect")
    public ResponseEntity<PestDetectionResponse> detectPest(
            @RequestParam("image") MultipartFile image,
            @RequestParam("cropType") String cropType) throws Exception {
        log.info("POST /api/pest/detect — cropType: {}, imageSize: {} bytes", cropType, image.getSize());
        PestDetectionResponse response = pestDetectionService.detectPest(image, cropType);
        log.info("Pest detection result — pest: {}, confidence: {}%", response.getPestName(), response.getConfidencePercent());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<PestReport>> getHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("GET /api/pest/history — user: {}", email);
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found for pest history: {}", email);
                    return new RuntimeException("User not found");
                }).getId();
        List<PestReport> history = pestDetectionService.getUserHistory(userId);
        log.info("Pest history returned — {} reports for user: {}", history.size(), email);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/alerts/{district}")
    public ResponseEntity<List<Object[]>> getDistrictAlerts(@PathVariable String district) {
        log.info("GET /api/pest/alerts/{}", district);
        // Returns top pests in a district
        return ResponseEntity.ok(
                pestDetectionService.getUserHistory(0L) // adjust per requirements
                        .stream().limit(5).map(r -> new Object[]{r.getPestName(), r.getDistrict()}).toList()
        );
    }
}
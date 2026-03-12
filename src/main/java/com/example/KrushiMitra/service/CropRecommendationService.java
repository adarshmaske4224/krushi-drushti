package com.example.KrushiMitra.service;

import com.example.KrushiMitra.dto.CropRecommendationDTO;
import com.example.KrushiMitra.dto.CropRecommendationRequest;
import com.example.KrushiMitra.dto.CropRecommendationResponse;
import com.example.KrushiMitra.dto.ScoreBreakdownDTO;
import com.example.KrushiMitra.entity.CropInformation;
import com.example.KrushiMitra.entity.DistrictClimate;
import com.example.KrushiMitra.exception.ResourceNotFoundException;
import com.example.KrushiMitra.repository.CropRepository;
import com.example.KrushiMitra.repository.DistrictClimateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CropRecommendationService {

    private final CropRepository cropRepository;
    private final DistrictClimateRepository districtClimateRepository;
    private final CropScoringService cropScoringService;

    /**
     * Returns the top 5 recommended crops based on district, month, irrigation and soil type.
     */
    public CropRecommendationResponse getRecommendations(CropRecommendationRequest request) {

        log.info("Processing crop recommendations for district: {}, month: {}, irrigation: {}, soil: {}", 
                request.getDistrict(), request.getMonth(), request.getIrrigation(), request.getSoilType());

        // 1. Fetch district climate data
        DistrictClimate district = districtClimateRepository
                .findByDistrictNameIgnoreCase(request.getDistrict())
                .orElseThrow(() -> {
                    log.error("District not found in climate database: {}", request.getDistrict());
                    return new ResourceNotFoundException("District not found: " + request.getDistrict());
                });

        // 2. Determine season from month
        String season = determineSeason(request.getMonth());
        log.info("Determined season: {} for month: {}", season, request.getMonth());

        // 3. Fetch all crops
        List<CropInformation> allCrops = cropRepository.findAll();
        
        // 4. Score all crops (No strict filtering, but pass season to scoring service)
        List<CropRecommendationDTO> recommendations = allCrops.stream()
                .map(crop -> {
                    int score = cropScoringService.calculateTotalScore(crop, district, request.getSoilType(), request.getIrrigation(), season);
                    double profit = cropScoringService.calculateProfit(crop);
                    List<ScoreBreakdownDTO> breakdown =
                            cropScoringService.getDetailedBreakdown(crop, district, request.getSoilType(), request.getIrrigation(), season);

                    return CropRecommendationDTO.builder()
                            .crop(crop.getCropName())
                            .score(score)
                            .expectedProfit(profit)
                            .season(crop.getSeason())
                            .soilType(crop.getSoilType())
                            .waterRequirement(crop.getWaterRequirement())
                            .growthDays(crop.getGrowthDays())
                            .category(crop.getCategory())
                            .scoreBreakdown(breakdown)
                            .build();
                })
                .sorted(Comparator.comparingInt(CropRecommendationDTO::getScore).reversed())
                .limit(5)
                .collect(Collectors.toList());

        return CropRecommendationResponse.builder()
                .district(district.getDistrictName())
                .season(season)
                .recommendations(recommendations)
                .build();
    }

    private String determineSeason(String month) {
        if (month == null) return "KHARIF";
        String m = month.toLowerCase();
        if (m.contains("june") || m.contains("july") || m.contains("august") || m.contains("september") || m.contains("october")) {
            return "KHARIF";
        }
        if (m.contains("november") || m.contains("december") || m.contains("january") || m.contains("february") || m.contains("march")) {
            return "RABI";
        }
        if (m.contains("april") || m.contains("may")) {
            return "ZAID";
        }
        return "KHARIF";
    }
}

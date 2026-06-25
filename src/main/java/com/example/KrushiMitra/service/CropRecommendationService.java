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
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CropRecommendationService {

    private final CropRepository cropRepository;
    private final DistrictClimateRepository districtClimateRepository;
    private final CropScoringService cropScoringService;

    /**
     * Returns the top 5 recommended crops for each category based on district, month, irrigation and soil type.
     */
    public CropRecommendationResponse getRecommendations(CropRecommendationRequest request) {

        log.info("Processing multi-category crop recommendations for district: {}, month: {}, irrigation: {}, soil: {}", 
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
        
        // Debug: Log all categories in DB
        java.util.Set<String> dbCategories = allCrops.stream()
                .map(c -> c.getCategory() != null ? c.getCategory() : "NULL")
                .collect(java.util.stream.Collectors.toSet());
        log.info("Categories found in database: {}", dbCategories);
        
        // 4. Filter and score crops
        List<CropRecommendationDTO> allScoredCrops = allCrops.stream()
                .filter(crop -> {
                    // STRICT seasonal filter: only show crops that match the detected season perfectly
                    double seasonMatch = cropScoringService.calculateSeasonMatch(crop, season);
                    return seasonMatch >= 15.0; 
                })
                .map(crop -> {
                    int score = cropScoringService.calculateTotalScore(crop, district, request.getSoilType(), request.getIrrigation(), season);
                    double profit = cropScoringService.calculateProfit(crop);
                    List<ScoreBreakdownDTO> breakdown =
                            cropScoringService.getDetailedBreakdown(crop, district, request.getSoilType(), request.getIrrigation(), season);

                    return CropRecommendationDTO.builder()
                            .crop(crop.getCropName() != null ? crop.getCropName().trim() : "Unknown")
                            .score(score)
                            .expectedProfit(profit)
                            .season(crop.getSeason())
                            .soilType(crop.getSoilType())
                            .waterRequirement(crop.getWaterRequirement())
                            .growthDays(crop.getGrowthDays())
                            .category(crop.getCategory() != null ? crop.getCategory().trim() : "Other")
                            .scoreBreakdown(breakdown)
                            .build();
                })
                .collect(Collectors.toList());

        // 5. Group by crop name first to remove duplicates (keep highest score)
        // Use normalized name (trimmed, case-insensitive) as key
        Map<String, CropRecommendationDTO> distinctCrops = new java.util.HashMap<>();
        for (CropRecommendationDTO rec : allScoredCrops) {
            String key = rec.getCrop().toLowerCase().trim();
            if (!distinctCrops.containsKey(key) || rec.getScore() > distinctCrops.get(key).getScore()) {
                distinctCrops.put(key, rec);
            }
        }

        log.info("Total distinct crops after scoring: {}", distinctCrops.size());

        // 6. Group by category and take top 5
        Map<String, List<CropRecommendationDTO>> groupedRecommendations = distinctCrops.values().stream()
                .collect(Collectors.groupingBy(crop -> {
                    String cat = crop.getCategory().toLowerCase();
                    if (cat.contains("grain") || cat.contains("cereal") || cat.contains("धान्य")) return "Grain";
                    if (cat.contains("pulse") || cat.contains("oilseed") || cat.contains("seed") || cat.contains("कडधान्य") || cat.contains("तेलबिया")) return "PulseOilseed";
                    if (cat.contains("vegetable") || cat.contains("veg") || cat.contains("भाजीपाला")) return "Vegetable";
                    if (cat.contains("fruit") || cat.contains("फळे")) return "Fruit";
                    return "Other";
                }))
                .entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> e.getValue().stream()
                                .sorted(Comparator.comparingInt(CropRecommendationDTO::getScore).reversed())
                                .limit(5)
                                .collect(Collectors.toList())
                ));
        
        // Ensure all 4 required categories are present in the response
        String[] requiredCategories = {"Grain", "PulseOilseed", "Vegetable", "Fruit"};
        for (String cat : requiredCategories) {
            groupedRecommendations.putIfAbsent(cat, new java.util.ArrayList<>());
        }

        return CropRecommendationResponse.builder()
                .district(district.getDistrictName())
                .season(season)
                .recommendations(groupedRecommendations)
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

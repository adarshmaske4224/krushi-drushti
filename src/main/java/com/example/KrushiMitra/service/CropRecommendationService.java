package com.example.KrushiMitra.service;

import com.example.KrushiMitra.dto.CropRecommendationDTO;
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
     * Returns the top 5 recommended crops for the given district,
     * sorted by suitability score (descending), with detailed reasons.
     */
    public CropRecommendationResponse getRecommendations(String districtName) {

        log.info("Getting crop recommendations for district: {}", districtName);

        // 1. Fetch district climate data
        DistrictClimate district = districtClimateRepository
                .findByDistrictNameIgnoreCase(districtName)
                .orElseThrow(() -> {
                    log.error("District not found in climate database: {}", districtName);
                    return new ResourceNotFoundException(
                            "District not found: " + districtName);
                });
        log.debug("District climate data loaded — temp: {}-{}°C, rainfall: {}-{}mm, soil: {}",
                district.getTempMin(), district.getTempMax(),
                district.getRainfallMin(), district.getRainfallMax(),
                district.getSoilType());

        // 2. Fetch all crops
        List<CropInformation> allCrops = cropRepository.findAll();
        log.info("Total crops in database: {}", allCrops.size());

        if (allCrops.isEmpty()) {
            log.error("No crops found in the database");
            throw new ResourceNotFoundException("No crops found in the database");
        }

        // 3. Score each crop, build detailed DTOs
        List<CropRecommendationDTO> recommendations = allCrops.stream()
                .map(crop -> {
                    int score = cropScoringService.calculateTotalScore(crop, district);
                    double profit = cropScoringService.calculateProfit(crop);
                    List<ScoreBreakdownDTO> breakdown =
                            cropScoringService.getDetailedBreakdown(crop, district);

                    log.debug("Scored crop: {} — score: {}, profit: ₹{}", crop.getCropName(), score, profit);

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
                // 4. Sort by score descending
                .sorted(Comparator.comparingInt(CropRecommendationDTO::getScore).reversed())
                // 5. Take the top 5
                .limit(5)
                .collect(Collectors.toList());

        log.info("Top 5 crop recommendations for {} — {}", districtName,
                recommendations.stream().map(r -> r.getCrop() + "(" + r.getScore() + ")").collect(Collectors.joining(", ")));

        return CropRecommendationResponse.builder()
                .district(district.getDistrictName())
                .recommendations(recommendations)
                .build();
    }
}

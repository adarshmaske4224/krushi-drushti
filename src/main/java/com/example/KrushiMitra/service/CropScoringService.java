package com.example.KrushiMitra.service;

import com.example.KrushiMitra.dto.ScoreBreakdownDTO;
import com.example.KrushiMitra.entity.CropInformation;
import com.example.KrushiMitra.entity.DistrictClimate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;

/**
 * Calculates a suitability score (0–100) for a crop given a district's climate data.
 *
 * Scoring breakdown:
 *   Climate Suitability  → 25 pts
 *   Soil Compatibility   → 20 pts
 *   Season Match         → 15 pts
 *   Water Availability   → 10 pts
 *   Profit Potential     → 15 pts
 *   Growth Duration      →  5 pts
 *   Market Demand        → 10 pts
 */
@Slf4j
@Service
public class CropScoringService {

    // ── 1. Climate Suitability (25 pts) ──────────────────────────────────
    public double calculateClimateSuitability(CropInformation crop, DistrictClimate district) {
        double tempScore = calculateRangeOverlap(
                crop.getTempMin(), crop.getTempMax(),
                district.getTempMin(), district.getTempMax());

        double rainScore = calculateRangeOverlap(
                crop.getRainfallMin(), crop.getRainfallMax(),
                district.getRainfallMin(), district.getRainfallMax());

        // Temperature gets 60 % weight, rainfall 40 %
        return (tempScore * 0.6 + rainScore * 0.4) * 25;
    }

    // ── 2. Soil Compatibility (20 pts) ───────────────────────────────────
    public double calculateSoilCompatibility(CropInformation crop, DistrictClimate district) {
        if (crop.getSoilType() == null || district.getSoilType() == null) {
            return 10; // partial score when data is missing
        }

        String cropSoil = crop.getSoilType().toLowerCase().trim();
        String districtSoil = district.getSoilType().toLowerCase().trim();

        if (districtSoil.contains(cropSoil) || cropSoil.contains(districtSoil)) {
            return 20; // exact match
        }

        // partial match – check for overlapping soil keywords
        String[] cropSoils = cropSoil.split("[,/\\s]+");
        String[] districtSoils = districtSoil.split("[,/\\s]+");
        for (String cs : cropSoils) {
            for (String ds : districtSoils) {
                if (cs.equals(ds)) return 15;
            }
        }
        return 5; // no match at all
    }

    // ── 3. Season Match (15 pts) ─────────────────────────────────────────
    public double calculateSeasonMatch(CropInformation crop) {
        if (crop.getSeason() == null) return 7;

        String season = crop.getSeason().toLowerCase().trim();
        String currentSeason = getCurrentSeason();

        if (season.contains(currentSeason) || season.equalsIgnoreCase("whole year")
                || season.equalsIgnoreCase("all")) {
            return 15;
        }

        // Adjacent-season partial credit
        String nextSeason = getNextSeason(currentSeason);
        if (season.contains(nextSeason)) {
            return 10;
        }

        return 3;
    }

    // ── 4. Water Availability (10 pts) ───────────────────────────────────
    public double calculateWaterAvailability(CropInformation crop, DistrictClimate district) {
        if (crop.getWaterRequirement() == null) return 5;

        String requirement = crop.getWaterRequirement().toLowerCase().trim();
        boolean hasIrrigation = district.getWaterSource() != null
                && (district.getWaterSource().toLowerCase().contains("canal")
                    || district.getWaterSource().toLowerCase().contains("river")
                    || district.getWaterSource().toLowerCase().contains("well")
                    || district.getWaterSource().toLowerCase().contains("irrigation"));

        if (requirement.contains("low")) {
            return 10; // low-water crops always score well
        } else if (requirement.contains("medium")) {
            return hasIrrigation ? 8 : 5;
        } else if (requirement.contains("high")) {
            return hasIrrigation ? 7 : 3;
        }

        return 5;
    }

    // ── 5. Profit Potential (15 pts) ─────────────────────────────────────
    public double calculateProfitPotential(CropInformation crop) {
        double profit = calculateProfit(crop);

        if (profit >= 50000) return 15;
        if (profit >= 30000) return 12;
        if (profit >= 15000) return 9;
        if (profit >= 5000)  return 6;
        return 3;
    }

    // ── 6. Growth Duration (5 pts) ───────────────────────────────────────
    public double calculateGrowthDuration(CropInformation crop) {
        if (crop.getGrowthDays() == null) return 2.5;

        int days = crop.getGrowthDays();
        if (days <= 90)  return 5;   // short cycle – quick returns
        if (days <= 150) return 3.5;
        return 2;
    }

    // ── 7. Market Demand (10 pts) ────────────────────────────────────────
    public double calculateMarketDemand(CropInformation crop) {
        if (crop.getCategory() == null) return 5;

        String category = crop.getCategory().toLowerCase().trim();

        // High-demand categories
        if (category.contains("cereal") || category.contains("pulse")
                || category.contains("oilseed") || category.contains("vegetable")) {
            return 10;
        }

        // Medium-demand
        if (category.contains("fruit") || category.contains("spice")
                || category.contains("cash crop") || category.contains("commercial")) {
            return 7;
        }

        return 5;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Aggregate score
    // ═══════════════════════════════════════════════════════════════════
    public int calculateTotalScore(CropInformation crop, DistrictClimate district) {
        double total = 0;
        total += calculateClimateSuitability(crop, district);   // 25
        total += calculateSoilCompatibility(crop, district);    // 20
        total += calculateSeasonMatch(crop);                    // 15
        total += calculateWaterAvailability(crop, district);    // 10
        total += calculateProfitPotential(crop);                // 15
        total += calculateGrowthDuration(crop);                 //  5
        total += calculateMarketDemand(crop);                   // 10

        return (int) Math.round(Math.min(total, 100));
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Detailed breakdown with reasons
    // ═══════════════════════════════════════════════════════════════════
    public List<ScoreBreakdownDTO> getDetailedBreakdown(CropInformation crop, DistrictClimate district) {
        List<ScoreBreakdownDTO> breakdown = new ArrayList<>();

        // 1. Climate Suitability
        double climateScore = calculateClimateSuitability(crop, district);
        String climateReason;
        if (climateScore >= 20) {
            climateReason = String.format(
                "Excellent climate match. Crop needs %s–%s°C temp and %s–%s mm rainfall. "
                + "District provides %s–%s°C and %s–%s mm — very well suited.",
                fmt(crop.getTempMin()), fmt(crop.getTempMax()),
                fmt(crop.getRainfallMin()), fmt(crop.getRainfallMax()),
                fmt(district.getTempMin()), fmt(district.getTempMax()),
                fmt(district.getRainfallMin()), fmt(district.getRainfallMax()));
        } else if (climateScore >= 12) {
            climateReason = String.format(
                "Moderate climate match. Crop range: %s–%s°C / %s–%s mm. "
                + "District: %s–%s°C / %s–%s mm — partial overlap.",
                fmt(crop.getTempMin()), fmt(crop.getTempMax()),
                fmt(crop.getRainfallMin()), fmt(crop.getRainfallMax()),
                fmt(district.getTempMin()), fmt(district.getTempMax()),
                fmt(district.getRainfallMin()), fmt(district.getRainfallMax()));
        } else {
            climateReason = String.format(
                "Poor climate match. Crop needs %s–%s°C / %s–%s mm but district has %s–%s°C / %s–%s mm.",
                fmt(crop.getTempMin()), fmt(crop.getTempMax()),
                fmt(crop.getRainfallMin()), fmt(crop.getRainfallMax()),
                fmt(district.getTempMin()), fmt(district.getTempMax()),
                fmt(district.getRainfallMin()), fmt(district.getRainfallMax()));
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("Climate Suitability").maxPoints(25)
                .scored((int) Math.round(climateScore)).reason(climateReason).build());

        // 2. Soil Compatibility
        double soilScore = calculateSoilCompatibility(crop, district);
        String soilReason;
        if (soilScore >= 18) {
            soilReason = String.format("Perfect soil match. Crop grows best in '%s' soil and district has '%s' soil.",
                    safe(crop.getSoilType()), safe(district.getSoilType()));
        } else if (soilScore >= 12) {
            soilReason = String.format("Partial soil match. Crop prefers '%s' but district has '%s' — some compatibility.",
                    safe(crop.getSoilType()), safe(district.getSoilType()));
        } else {
            soilReason = String.format("Low soil compatibility. Crop needs '%s' soil, district has '%s'.",
                    safe(crop.getSoilType()), safe(district.getSoilType()));
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("Soil Compatibility").maxPoints(20)
                .scored((int) Math.round(soilScore)).reason(soilReason).build());

        // 3. Season Match
        double seasonScore = calculateSeasonMatch(crop);
        String currentSeason = getCurrentSeason();
        String seasonReason;
        if (seasonScore >= 14) {
            seasonReason = String.format("Great timing! This is a '%s' crop and current season is '%s' — ideal for sowing now.",
                    safe(crop.getSeason()), currentSeason);
        } else if (seasonScore >= 8) {
            seasonReason = String.format("Crop season is '%s', current season is '%s' — you can start preparing for the next season.",
                    safe(crop.getSeason()), currentSeason);
        } else {
            seasonReason = String.format("Off-season crop. '%s' crop is not suited for the current '%s' season.",
                    safe(crop.getSeason()), currentSeason);
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("Season Match").maxPoints(15)
                .scored((int) Math.round(seasonScore)).reason(seasonReason).build());

        // 4. Water Availability
        double waterScore = calculateWaterAvailability(crop, district);
        String waterReason;
        if (waterScore >= 8) {
            waterReason = String.format("Good water match. Crop needs '%s' water and district has '%s' water source.",
                    safe(crop.getWaterRequirement()), safe(district.getWaterSource()));
        } else if (waterScore >= 5) {
            waterReason = String.format("Moderate water availability. Crop needs '%s' water; district source is '%s' — manageable.",
                    safe(crop.getWaterRequirement()), safe(district.getWaterSource()));
        } else {
            waterReason = String.format("Water concern. Crop requires '%s' water but district has limited source ('%s').",
                    safe(crop.getWaterRequirement()), safe(district.getWaterSource()));
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("Water Availability").maxPoints(10)
                .scored((int) Math.round(waterScore)).reason(waterReason).build());

        // 5. Profit Potential
        double profitScore = calculateProfitPotential(crop);
        double profit = calculateProfit(crop);
        String profitReason;
        if (profitScore >= 12) {
            profitReason = String.format("High profitability! Expected profit ₹%,.0f/acre (yield %.0f × ₹%.0f price − ₹%,.0f cost).",
                    profit, d(crop.getYieldPerAcre()), d(crop.getAvgPrice()), d(crop.getAvgCost()));
        } else if (profitScore >= 6) {
            profitReason = String.format("Moderate profit of ₹%,.0f/acre. Yield: %.0f, price: ₹%.0f, cost: ₹%,.0f.",
                    profit, d(crop.getYieldPerAcre()), d(crop.getAvgPrice()), d(crop.getAvgCost()));
        } else {
            profitReason = String.format("Low profitability. Expected profit only ₹%,.0f/acre.",
                    profit);
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("Profit Potential").maxPoints(15)
                .scored((int) Math.round(profitScore)).reason(profitReason).build());

        // 6. Growth Duration
        double growthScore = calculateGrowthDuration(crop);
        String growthReason;
        if (crop.getGrowthDays() != null) {
            if (growthScore >= 4) {
                growthReason = String.format("Short growth cycle of %d days — quick returns, lets you plan multiple cycles per year.",
                        crop.getGrowthDays());
            } else if (growthScore >= 3) {
                growthReason = String.format("Medium growth period of %d days — standard cycle, reasonable turnaround.",
                        crop.getGrowthDays());
            } else {
                growthReason = String.format("Long growth cycle of %d days — requires patience, ties up land longer.",
                        crop.getGrowthDays());
            }
        } else {
            growthReason = "Growth duration data not available.";
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("Growth Duration").maxPoints(5)
                .scored((int) Math.round(growthScore)).reason(growthReason).build());

        // 7. Market Demand
        double marketScore = calculateMarketDemand(crop);
        String marketReason;
        if (marketScore >= 9) {
            marketReason = String.format("High market demand! '%s' category crops (like %s) are always in demand and easy to sell.",
                    safe(crop.getCategory()), crop.getCropName());
        } else if (marketScore >= 6) {
            marketReason = String.format("Moderate market demand. '%s' category has steady buyers.",
                    safe(crop.getCategory()));
        } else {
            marketReason = String.format("Limited market demand for '%s' category crops. Find buyers before planting.",
                    safe(crop.getCategory()));
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("Market Demand").maxPoints(10)
                .scored((int) Math.round(marketScore)).reason(marketReason).build());

        return breakdown;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Profit helper
    // ═══════════════════════════════════════════════════════════════════
    public double calculateProfit(CropInformation crop) {
        double yieldPerAcre = crop.getYieldPerAcre() != null ? crop.getYieldPerAcre() : 0;
        double avgPrice     = crop.getAvgPrice()     != null ? crop.getAvgPrice()     : 0;
        double avgCost      = crop.getAvgCost()      != null ? crop.getAvgCost()      : 0;
        return (yieldPerAcre * avgPrice) - avgCost;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Private helpers
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Returns a 0–1 overlap ratio between two numeric ranges.
     */
    private double calculateRangeOverlap(Double min1, Double max1, Double min2, Double max2) {
        if (min1 == null || max1 == null || min2 == null || max2 == null) return 0.5;

        double overlapStart = Math.max(min1, min2);
        double overlapEnd   = Math.min(max1, max2);

        if (overlapStart > overlapEnd) {
            // No overlap – score degrades proportionally to the gap
            double gap    = overlapStart - overlapEnd;
            double range  = Math.max(max1 - min1, max2 - min2);
            double ratio  = range > 0 ? gap / range : 1;
            return Math.max(0, 1 - ratio);
        }

        double overlapLength = overlapEnd - overlapStart;
        double rangeLength   = Math.max(max1 - min1, max2 - min2);
        return rangeLength > 0 ? overlapLength / rangeLength : 1;
    }

    private String getCurrentSeason() {
        Month month = LocalDate.now().getMonth();
        int m = month.getValue();

        if (m >= 6 && m <= 10) return "kharif";
        if (m >= 11 || m <= 2) return "rabi";
        return "zaid";
    }

    private String getNextSeason(String current) {
        return switch (current) {
            case "kharif" -> "rabi";
            case "rabi"   -> "zaid";
            default       -> "kharif";
        };
    }

    private String fmt(Double v) { return v != null ? String.format("%.0f", v) : "N/A"; }
    private String safe(String s) { return s != null && !s.isBlank() ? s : "N/A"; }
    private double d(Double v) { return v != null ? v : 0; }
}


package com.example.KrushiMitra.service;

import com.example.KrushiMitra.dto.ScoreBreakdownDTO;
import com.example.KrushiMitra.entity.CropInformation;
import com.example.KrushiMitra.entity.DistrictClimate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

    /**
     * Calculates a suitability score (0–100) for a crop given a district's climate data.
     *
     * Scoring breakdown:
     *   Climate Suitability    → 25 pts
     *   Soil Compatibility     → 20 pts
     *   Irrigation Compatibility → 15 pts
     *   Profit Potential       → 25 pts
     *   Growth Duration        → 10 pts
     *   Market Demand          →  5 pts
     */
    @Slf4j
    @Service
    public class CropScoringService {

    // ── 0. Season Match (15 pts) ─────────────────────────────────────────
    public double calculateSeasonMatch(CropInformation crop, String detectedSeason) {
        if (crop.getSeason() == null || detectedSeason == null) return 0; // Mandatory: must have season
        String s = crop.getSeason().toUpperCase();
        String d = detectedSeason.toUpperCase();
        
        if (s.contains(d) || s.contains("WHOLE YEAR") || s.contains("ALL")) {
            return 15;
        }
        return 0; // Strict mismatch
    }

    // ── 1. Climate Suitability (25 pts) ──────────────────────────────────
    public double calculateClimateSuitability(CropInformation crop, DistrictClimate district) {
        double tempScore = calculateRangeOverlap(
                crop.getTempMin(), crop.getTempMax(),
                district.getTempMin(), district.getTempMax());

        double rainScore = calculateRangeOverlap(
                crop.getRainfallMin(), crop.getRainfallMax(),
                district.getRainfallMin(), district.getRainfallMax());

        return (tempScore * 0.6 + rainScore * 0.4) * 25;
    }

    // ── 2. Soil Compatibility (20 pts) ───────────────────────────────────
    public double calculateSoilCompatibility(CropInformation crop, String inputSoilType) {
        if (crop.getSoilType() == null || inputSoilType == null) {
            return 10;
        }

        String cropSoil = crop.getSoilType().toLowerCase().trim();
        String userSoil = inputSoilType.toLowerCase().trim();

        if (userSoil.contains(cropSoil) || cropSoil.contains(userSoil)) {
            return 20;
        }

        String[] cropSoils = cropSoil.split("[,/\\s]+");
        String[] userSoils = userSoil.split("[,/\\s]+");
        for (String cs : cropSoils) {
            for (String us : userSoils) {
                if (cs.equals(us)) return 14;
            }
        }
        return 0; // Mismatch
    }

    // ── 3. Irrigation Compatibility (15 pts) ──────────────────────────────
    public double calculateIrrigationCompatibility(CropInformation crop, String irrigationType) {
        if (crop.getWaterRequirement() == null || irrigationType == null) return 7.5;

        String req = crop.getWaterRequirement().toLowerCase();
        String irr = irrigationType.toLowerCase();

        if (req.contains("high")) {
            if (irr.contains("river") || irr.contains("canal") || irr.contains("drip")) return 15;
            if (irr.contains("well") || irr.contains("borewell")) return 10;
            return 0; 
        }
        if (req.contains("medium")) {
            if (irr.contains("rainfed")) return 5;
            return 15;
        }
        if (req.contains("low")) {
            return 15;
        }
        return 7.5;
    }

    // ── 4. Profit Potential (25 pts) ─────────────────────────────────────
    public double calculateProfitPotential(CropInformation crop) {
        double profit = calculateProfit(crop);

        if (profit >= 50000) return 25;
        if (profit >= 40000) return 20;
        if (profit >= 30000) return 15;
        if (profit >= 20000) return 10;
        return 5;
    }

    // ── 5. Growth Duration (10 pts) ───────────────────────────────────────
    public double calculateGrowthDuration(CropInformation crop) {
        if (crop.getGrowthDays() == null) return 5;

        int days = crop.getGrowthDays();
        if (days <= 90)  return 10;
        if (days <= 120) return 8;
        if (days <= 150) return 6;
        return 4;
    }

    // ── 6. Market Demand (5 pts) ─────────────────────────────────────────
    public double calculateMarketDemand(CropInformation crop) {
        if (crop.getCategory() == null) return 2.5;

        String category = crop.getCategory().toLowerCase().trim();

        if (category.contains("cereal") || category.contains("pulse")
                || category.contains("oilseed") || category.contains("vegetable")) {
            return 5;
        }

        if (category.contains("fruit") || category.contains("spice")
                || category.contains("cash crop") || category.contains("commercial")) {
            return 3.5;
        }

        return 2.5;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Aggregate score
    // ═══════════════════════════════════════════════════════════════════
    public int calculateTotalScore(CropInformation crop, DistrictClimate district, String soilType, String irrigation, String season) {
        // MANDATORY: Season match is strict. If season is wrong, other factors don't matter.
        double seasonScore = calculateSeasonMatch(crop, season);
        if (seasonScore == 0) return 0;

        // Note: Season is used as a hard gate. 
        // The core suitability score is calculated from the following factors (totalling 100):
        double suitabilityScore = calculateClimateSuitability(crop, district) + // 25
                                 calculateSoilCompatibility(crop, soilType) +    // 20
                                 calculateIrrigationCompatibility(crop, irrigation) + // 15
                                 calculateProfitPotential(crop) +                // 25
                                 calculateGrowthDuration(crop) +                 // 10
                                 calculateMarketDemand(crop);                    // 5

        return (int) Math.round(Math.min(suitabilityScore, 100));
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Detailed breakdown with reasons
    // ═══════════════════════════════════════════════════════════════════
    public List<ScoreBreakdownDTO> getDetailedBreakdown(CropInformation crop, DistrictClimate district, String soilType, String irrigation, String season) {
        List<ScoreBreakdownDTO> breakdown = new ArrayList<>();

        // 0. Season Match
        double seasonScore = calculateSeasonMatch(crop, season);
        String seasonReason;
        if (seasonScore >= 15) {
            seasonReason = String.format("हंगाम अचूक आहे. हे पीक %s हंगामात घेता येते.", translateSeason(crop.getSeason()));
        } else {
            seasonReason = String.format("हंगाम जुळत नाही. तुम्ही %s निवडला आहे, पण हे पीक %s हंगामातील आहे.", 
                translateSeason(season), translateSeason(crop.getSeason()));
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("हंगाम सुसंगतता (Season)").maxPoints(15)
                .scored((int) Math.round(seasonScore)).reason(seasonReason).build());

        // 1. Climate Suitability
        double climateScore = calculateClimateSuitability(crop, district);
        String climateReason;
        if (climateScore >= 16) {
            climateReason = String.format(
                "हवामान उत्कृष्ट आहे. या पिकासाठी %s–%s°C तापमान आणि %s–%s मिमी पाऊस आवश्यक आहे. "
                + "तुमच्या जिल्हयात %s–%s°C तापमान आणि %s–%s मिमी पाऊस उपलब्ध आहे.",
                fmt(crop.getTempMin()), fmt(crop.getTempMax()),
                fmt(crop.getRainfallMin()), fmt(crop.getRainfallMax()),
                fmt(district.getTempMin()), fmt(district.getTempMax()),
                fmt(district.getRainfallMin()), fmt(district.getRainfallMax()));
        } else if (climateScore >= 8) {
            climateReason = String.format(
                "हवामान मध्यम स्वरूपाचे आहे. पिकाची गरज: %s–%s°C / %s–%s मिमी. "
                + "जिल्ह्यातील स्थिती: %s–%s°C / %s–%s मिमी.",
                fmt(crop.getTempMin()), fmt(crop.getTempMax()),
                fmt(crop.getRainfallMin()), fmt(crop.getRainfallMax()),
                fmt(district.getTempMin()), fmt(district.getTempMax()),
                fmt(district.getRainfallMin()), fmt(district.getRainfallMax()));
        } else {
            climateReason = String.format(
                "हवामान सुसंगत नाही. पिकासाठी %s–%s°C / %s–%s मिमी आवश्यक आहे, तर जिल्ह्यात %s–%s°C / %s–%s मिमी आहे.",
                fmt(crop.getTempMin()), fmt(crop.getTempMax()),
                fmt(crop.getRainfallMin()), fmt(crop.getRainfallMax()),
                fmt(district.getTempMin()), fmt(district.getTempMax()),
                fmt(district.getRainfallMin()), fmt(district.getRainfallMax()));
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("हवामान अनुकूलता (Climate)").maxPoints(25)
                .scored((int) Math.round(climateScore)).reason(climateReason).build());

        // 2. Soil Compatibility
        double soilScore = calculateSoilCompatibility(crop, soilType);
        String soilReason;
        if (soilScore >= 14) {
            soilReason = String.format("माती या पिकासाठी अत्यंत योग्य आहे. हे पीक '%s' मातीत चांगले येते आणि तुम्ही '%s' निवडली आहे.",
                    translateSoil(crop.getSoilType()), translateSoil(soilType));
        } else if (soilScore >= 8) {
            soilReason = String.format("माती मध्यम स्वरूपाची आहे. निवडलेली माती '%s' ही '%s' पिकासाठी साधारण अनुकूल आहे.",
                    translateSoil(soilType), translateSoil(crop.getSoilType()));
        } else {
            soilReason = String.format("माती जुळत नाही. पिकासाठी '%s' माती हवी, पण तुम्ही '%s' निवडली आहे.",
                    translateSoil(crop.getSoilType()), translateSoil(soilType));
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("मातीची सुसंगतता (Soil)").maxPoints(20)
                .scored((int) Math.round(soilScore)).reason(soilReason).build());

        // 3. Irrigation Compatibility
        double irrigationScore = calculateIrrigationCompatibility(crop, irrigation);
        String irrigationReason;
        if (irrigationScore >= 14) {
            irrigationReason = String.format("पाण्याची उपलब्धता उत्तम आहे. '%s' द्वारे मिळणारे पाणी पिकाच्या '%s' गरजेसाठी पुरेसे आहे.",
                    translateIrrigation(irrigation), translateWaterReq(crop.getWaterRequirement()));
        } else if (irrigationScore >= 8) {
            irrigationReason = String.format("पाणी पुरेसे आहे. पिकाची गरज '%s' असून '%s' ही मध्यम सोय आहे.",
                    translateWaterReq(crop.getWaterRequirement()), translateIrrigation(irrigation));
        } else {
            irrigationReason = String.format("पाण्याची कमतरता! '%s' पिकाची गरज जास्त असून '%s' ही सोय अपुरी पडू शकते.",
                    crop.getCropName(), translateIrrigation(irrigation));
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("पाणी उपलब्धता (Irrigation)").maxPoints(15)
                .scored((int) Math.round(irrigationScore)).reason(irrigationReason).build());

        // 4. Profit Potential
        double profitScore = calculateProfitPotential(crop);
        double profit = calculateProfit(crop);
        String profitReason;
        if (profitScore >= 20) {
            profitReason = String.format("उच्च नफ्याची शक्यता! अंदाजित नफा ₹%,.0f/एकर आहे.", profit);
        } else if (profitScore >= 10) {
            profitReason = String.format("मध्यम स्वरूपाचा नफा ₹%,.0f/एकर.", profit);
        } else {
            profitReason = String.format("कमी नफा. अंदाजित नफा फक्त ₹%,.0f/एकर.", profit);
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("नफ्याची क्षमता (Profit)").maxPoints(25)
                .scored((int) Math.round(profitScore)).reason(profitReason).build());

        // 5. Growth Duration
        double growthScore = calculateGrowthDuration(crop);
        String growthReason;
        if (crop.getGrowthDays() != null) {
            growthReason = String.format("%d दिवसांचे पीक चक्र. %s", 
                crop.getGrowthDays(), 
                growthScore >= 4 ? "कमी कालावधीत उत्पादन मिळते." : "मध्यम ते जास्त कालावधी.");
        } else {
            growthReason = "पीक कालावधीची माहिती उपलब्ध नाही.";
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("पीक कालावधी (Growth)").maxPoints(10)
                .scored((int) Math.round(growthScore)).reason(growthReason).build());

        // 6. Market Demand
        double marketScore = calculateMarketDemand(crop);
        String marketReason;
        if (marketScore >= 4.5) {
            marketReason = String.format("बाजारात या पिकासाठी खूप मागणी आहे (%s श्रेणी).", translateCategory(crop.getCategory()));
        } else {
            marketReason = String.format("बाजारात या पिकासाठी स्थिर मागणी आहे (%s श्रेणी).", translateCategory(crop.getCategory()));
        }
        breakdown.add(ScoreBreakdownDTO.builder()
                .factor("बाजार मागणी (Market)").maxPoints(5)
                .scored((int) Math.round(marketScore)).reason(marketReason).build());

        return breakdown;
    }

    private String translateSeason(String season) {
        if (season == null) return "माहिती नाही";
        String s = season.toUpperCase();
        if (s.contains("KHARIF")) return "खरीप";
        if (s.contains("RABI")) return "रब्बी";
        if (s.contains("ZAID")) return "उन्हाळी (Zaid)";
        if (s.contains("WHOLE YEAR") || s.contains("ALL")) return "वर्षभर";
        return season;
    }

    private String translateSoil(String soil) {
        if (soil == null) return "माहिती नाही";
        String s = soil.toLowerCase();
        if (s.contains("black cotton")) return "काळी कापसाची माती";
        if (s.contains("black")) return "काळी माती";
        if (s.contains("sandy")) return "वाळूमय माती";
        if (s.contains("loamy")) return "लोमी माती";
        if (s.contains("red")) return "लाल माती";
        if (s.contains("clay")) return "चिकन माती";
        return soil;
    }

    private String translateIrrigation(String irr) {
        if (irr == null) return "माहिती नाही";
        String i = irr.toLowerCase();
        if (i.contains("rainfed")) return "कोरडवाहू (पाऊस)";
        if (i.contains("borewell")) return "बोअरवेल";
        if (i.contains("well")) return "विहीर";
        if (i.contains("river")) return "नदी";
        if (i.contains("canal")) return "कालवा";
        if (i.contains("pond")) return "शेततळे";
        if (i.contains("drip")) return "ठिबक सिंचन";
        return irr;
    }

    private String translateWaterReq(String req) {
        if (req == null) return "मध्यम";
        String r = req.toLowerCase();
        if (r.contains("high")) return "जास्त";
        if (r.contains("medium")) return "मध्यम";
        if (r.contains("low")) return "कमी";
        return req;
    }

    private String translateCategory(String cat) {
        if (cat == null) return "इतर";
        String c = cat.toLowerCase();
        if (c.contains("cereal")) return "धान्य";
        if (c.contains("pulse")) return "कडधान्य";
        if (c.contains("oilseed")) return "तेलबिया";
        if (c.contains("vegetable")) return "भाजीपाला";
        if (c.contains("fruit")) return "फळे";
        if (c.contains("spice")) return "मसाले";
        if (c.contains("cash")) return "नगदी पीक";
        return cat;
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

    private String fmt(Double v) { return v != null ? String.format("%.0f", v) : "N/A"; }
}


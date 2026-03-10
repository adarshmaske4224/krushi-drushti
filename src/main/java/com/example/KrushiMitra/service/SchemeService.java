package com.example.KrushiMitra.service;

import com.example.KrushiMitra.dto.SchemeRecommendationResponse;
import com.example.KrushiMitra.entity.Scheme;
import com.example.KrushiMitra.entity.SchemeRecommendation;
import com.example.KrushiMitra.entity.User;
import com.example.KrushiMitra.repository.SchemeRecommendationRepository;
import com.example.KrushiMitra.repository.SchemeRepository;
import com.example.KrushiMitra.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SchemeService {

    private final SchemeRepository schemeRepository;
    private final SchemeRecommendationRepository recommendationRepository;
    private final UserRepository userRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.api.url}")
    private String aiApiUrl;
    @Value("${ai.api.key}")
    private String aiApiKey;

    public SchemeRecommendationResponse.ListResponse getRecommendations()
            throws Exception {

        // Get logged in farmer
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all active schemes from DB
        List<Scheme> allSchemes = schemeRepository.findByIsActiveTrue();

        // ✅ Step 1 — Ask Gemini AI which schemes farmer is eligible for
        List<Long> eligibleIds = getAiEligibleSchemeIds(user, allSchemes);

        // ✅ Step 2 — For each eligible scheme get AI reasoning
        List<SchemeRecommendationResponse> results = new ArrayList<>();

        for (Scheme scheme : allSchemes) {
            if (!eligibleIds.contains(scheme.getId()))
                continue;

            // Get detailed AI reasoning for this scheme
            String reasoning = getAiReasoning(user, scheme);

            // Save recommendation to DB
            SchemeRecommendation rec = new SchemeRecommendation();
            rec.setUser(user);
            rec.setScheme(scheme);
            rec.setAiReasoning(reasoning);
            recommendationRepository.save(rec);

            results.add(SchemeRecommendationResponse.builder()
                    .schemeId(scheme.getId())
                    .schemeName(scheme.getName())
                    .description(scheme.getDescription())
                    .benefits(scheme.getBenefits())
                    .applicationUrl(scheme.getApplicationUrl())
                    .aiReasoning(reasoning)
                    .build());
        }

        SchemeRecommendationResponse.ListResponse response = new SchemeRecommendationResponse.ListResponse();
        response.setRecommendations(results);
        response.setTotalEligible(results.size());
        return response;
    }

    // ✅ Step 1 — AI decides which schemes farmer qualifies for
    private List<Long> getAiEligibleSchemeIds(User user,
            List<Scheme> schemes)
            throws Exception {

        // Build scheme list for AI
        StringBuilder schemeList = new StringBuilder();
        for (Scheme s : schemes) {
            schemeList.append(String.format(
                    """
                            ID: %d
                            Name: %s
                            Eligible States: %s
                            Max Land Size: %s acres
                            Max Annual Income: Rs.%s
                            Eligible Categories: %s
                            ---
                            """,
                    s.getId(),
                    s.getName(),
                    s.getEligibleStates(),
                    s.getMaxLandSizeAcres() != null ? s.getMaxLandSizeAcres() : "No limit",
                    s.getMaxAnnualIncome() != null ? s.getMaxAnnualIncome() : "No limit",
                    s.getEligibleCategories() != null ? s.getEligibleCategories() : "All"));
        }

        String prompt = """
                You are an Indian government scheme eligibility expert.

                Farmer Profile:
                - Name: %s
                - State: %s
                - District: %s
                - Land Size: %.1f acres
                - Primary Crop: %s
                - Category: %s
                - Annual Income: Rs.%.0f

                Available Government Schemes:
                %s

                Based on the farmer profile above, return ONLY the IDs of schemes
                this farmer is eligible for.

                Rules:
                - If eligible_states is ALL, any state qualifies
                - Farmer's land must be <= max_land_size_acres
                - Farmer's income must be <= max_annual_income
                - Farmer's category must be in eligible_categories

                Reply ONLY with comma separated IDs like: 1,2,3
                No explanation, no other text, just the IDs.
                If none eligible reply: NONE
                """.formatted(
                user.getFullName(),
                user.getState(),
                user.getDistrict(),
                user.getLandSizeAcres(),
                user.getPrimaryCrop(),
                user.getCategory(),
                user.getAnnualIncome() != null ? user.getAnnualIncome() : 0,
                schemeList.toString());

        String aiResponse = callGemini(prompt);
        System.out.println("AI Eligible Scheme IDs: " + aiResponse);

        List<Long> ids = new ArrayList<>();
        if (aiResponse == null || aiResponse.trim().equals("NONE"))
            return ids;

        // Parse comma separated IDs
        for (String part : aiResponse.trim().split(",")) {
            try {
                ids.add(Long.parseLong(part.trim()));
            } catch (NumberFormatException ignored) {
            }
        }
        return ids;
    }

    // ✅ Step 2 — AI explains WHY farmer is eligible for each scheme
    private String getAiReasoning(User user, Scheme scheme) throws Exception {
        String lang = "mr".equals(user.getPreferredLanguage())
                ? "CRITICAL: You MUST respond entirely in Marathi language using Devanagari script (मराठी लिपी). NEVER use English/Latin alphabet. Do NOT use Hindi."
                : "Respond entirely in English.";

        String prompt = """
                You are a helpful agricultural advisor in India.

                Farmer: %s, %s district, %s state
                Land: %.1f acres | Crop: %s | Category: %s | Income: Rs.%.0f/year

                Scheme: %s
                Benefits: %s
                Apply at: %s

                In exactly 2 sentences:
                1. Why this farmer is eligible
                2. How to apply and what benefit they get

                %s
                Keep it short, complete and encouraging.
                Do NOT cut off mid sentence.
                """.formatted(
                user.getFullName(),
                user.getDistrict(),
                user.getState(),
                user.getLandSizeAcres(),
                user.getPrimaryCrop(),
                user.getCategory(),
                user.getAnnualIncome() != null ? user.getAnnualIncome() : 0,
                scheme.getName(),
                scheme.getBenefits(),
                scheme.getApplicationUrl(),
                lang);

        return callGemini(prompt);
    }

    // ✅ Reusable Groq API caller
    private String callGemini(String prompt) throws Exception {
        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)),
                "temperature", 0.3, // ✅ low temp = more accurate
                "max_tokens", 1024);

        String url = aiApiUrl;

        try {
            String responseBody = webClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + aiApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseBody);
            return root.path("choices").get(0)
                    .path("message")
                    .path("content").asText();

        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("429")) {
                throw new RuntimeException(
                        "AI service is busy. Please wait 1 minute and try again.");
            }
            throw e;
        }
    }

    public List<Scheme> getAllSchemes() {
        return schemeRepository.findByIsActiveTrue();
    }
}

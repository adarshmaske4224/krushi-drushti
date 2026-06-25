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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
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
        log.info("Fetching scheme recommendations for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found for email: {}", email);
                    return new RuntimeException("User not found");
                });

        // Get all active schemes from DB
        List<Scheme> allSchemes = schemeRepository.findByIsActiveTrue();
        log.info("Found {} active schemes in database", allSchemes.size());

        // Step 1 — Ask AI which schemes farmer is eligible for
        List<Long> eligibleIds = getAiEligibleSchemeIds(user, allSchemes);
        log.info("AI identified {} eligible scheme IDs for user: {}", eligibleIds.size(), email);

        // Filter eligible schemes
        List<Scheme> eligibleSchemes = new ArrayList<>();
        for (Scheme scheme : allSchemes) {
            if (eligibleIds.contains(scheme.getId())) {
                eligibleSchemes.add(scheme);
            }
        }
        log.info("Filtered to {} eligible schemes", eligibleSchemes.size());

        // Step 2 — Get ALL reasoning in a SINGLE AI call (avoids rate limits)
        Map<Long, String> reasoningMap = getBatchAiReasoning(user, eligibleSchemes);
        log.debug("Received AI reasoning for {} schemes", reasoningMap.size());

        List<SchemeRecommendationResponse> results = new ArrayList<>();
        for (Scheme scheme : eligibleSchemes) {
            String reasoning = reasoningMap.getOrDefault(scheme.getId(),
                    "You are eligible for this scheme based on your profile. Visit " + scheme.getApplicationUrl() + " to apply.");

            // Save recommendation to DB
            SchemeRecommendation rec = new SchemeRecommendation();
            rec.setUser(user);
            rec.setScheme(scheme);
            rec.setAiReasoning(reasoning);
            recommendationRepository.save(rec);
            log.debug("Saved recommendation for scheme: {} (ID: {})", scheme.getName(), scheme.getId());

            results.add(SchemeRecommendationResponse.builder()
                    .schemeId(scheme.getId())
                    .schemeName(scheme.getName())
                    .description(scheme.getDescription())
                    .benefits(scheme.getBenefits())
                    .applicationUrl(scheme.getApplicationUrl())
                    .aiReasoning(reasoning)
                    .status(scheme.getStatus())
                    .statusNote(scheme.getStatusNote())
                    .build());
        }

        SchemeRecommendationResponse.ListResponse response = new SchemeRecommendationResponse.ListResponse();
        response.setRecommendations(results);
        response.setTotalEligible(results.size());
        log.info("Returning {} scheme recommendations for user: {}", results.size(), email);
        return response;
    }

    // Step 1 — AI decides which schemes farmer qualifies for
    private List<Long> getAiEligibleSchemeIds(User user,
            List<Scheme> schemes)
            throws Exception {

        log.info("Requesting AI eligibility check for {} schemes, farmer: {}", schemes.size(), user.getFullName());

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
        log.info("AI eligible scheme IDs response: {}", aiResponse);

        List<Long> ids = new ArrayList<>();
        if (aiResponse == null || aiResponse.trim().equals("NONE")) {
            log.warn("AI returned no eligible schemes (response: {})", aiResponse);
            return ids;
        }

        // Parse comma separated IDs
        for (String part : aiResponse.trim().split(",")) {
            try {
                ids.add(Long.parseLong(part.trim()));
            } catch (NumberFormatException e) {
                log.warn("Failed to parse scheme ID from AI response part: '{}'", part.trim());
            }
        }
        log.info("Parsed {} eligible scheme IDs: {}", ids.size(), ids);
        return ids;
    }

    // Step 2 — Get reasoning for ALL eligible schemes in ONE AI call
    private Map<Long, String> getBatchAiReasoning(User user, List<Scheme> schemes) throws Exception {
        if (schemes.isEmpty()) {
            log.info("No eligible schemes to get reasoning for");
            return Map.of();
        }

        log.info("Requesting batch AI reasoning for {} schemes", schemes.size());

        String lang = "mr".equals(user.getPreferredLanguage())
                ? "CRITICAL: You MUST respond entirely in Marathi language using Devanagari script (मराठी लिपी). NEVER use English/Latin alphabet."
                : "Respond entirely in English.";

        StringBuilder schemeList = new StringBuilder();
        for (Scheme s : schemes) {
            schemeList.append(String.format("ID:%d | %s | Benefits: %s | Apply: %s\n",
                    s.getId(), s.getName(),
                    s.getBenefits() != null ? s.getBenefits() : s.getDescription(),
                    s.getApplicationUrl()));
        }

        String prompt = """
                You are a helpful agricultural advisor in India.

                Farmer: %s, %s district, %s state
                Land: %.1f acres | Crop: %s | Category: %s | Income: Rs.%.0f/year

                The farmer is eligible for these schemes:
                %s

                For EACH scheme, write exactly 2 short sentences:
                1. Why this farmer is eligible
                2. How to apply and what benefit they get

                %s

                Format your response EXACTLY like this (one block per scheme):
                [ID:1] Your 2 sentences here.
                [ID:2] Your 2 sentences here.
                ...

                Keep each entry short and encouraging. Do NOT cut off mid sentence.
                """.formatted(
                user.getFullName(),
                user.getDistrict(),
                user.getState(),
                user.getLandSizeAcres(),
                user.getPrimaryCrop(),
                user.getCategory(),
                user.getAnnualIncome() != null ? user.getAnnualIncome() : 0,
                schemeList.toString(),
                lang);

        String aiResponse = callGemini(prompt);
        log.info("AI batch reasoning response length: {}", aiResponse != null ? aiResponse.length() : 0);

        // Parse response into map
        Map<Long, String> result = new java.util.HashMap<>();
        if (aiResponse == null) {
            log.warn("AI returned null response for batch reasoning");
            return result;
        }

        // Split by [ID:X] pattern
        String[] parts = aiResponse.split("\\[ID:");
        for (String part : parts) {
            part = part.trim();
            if (part.isEmpty()) continue;
            try {
                int bracketEnd = part.indexOf(']');
                if (bracketEnd > 0) {
                    Long id = Long.parseLong(part.substring(0, bracketEnd).trim());
                    String reasoning = part.substring(bracketEnd + 1).trim();
                    if (!reasoning.isEmpty()) {
                        result.put(id, reasoning);
                        log.debug("Parsed reasoning for scheme ID {}: {} chars", id, reasoning.length());
                    }
                }
            } catch (NumberFormatException e) {
                log.warn("Failed to parse scheme ID from reasoning block: '{}'", part.substring(0, Math.min(20, part.length())));
            }
        }
        log.info("Successfully parsed reasoning for {} schemes", result.size());
        return result;
    }

    // Reusable Groq API caller
    private String callGemini(String prompt) throws Exception {
        log.debug("Calling Groq AI API, prompt length: {} chars", prompt.length());

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)),
                "temperature", 0.3,
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
            String content = root.path("choices").get(0)
                    .path("message")
                    .path("content").asText();
            log.debug("Groq AI response received, content length: {} chars", content.length());
            return content;

        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("429")) {
                log.error("AI API rate limited (429). User should wait and retry.", e);
                throw new RuntimeException(
                        "AI service is busy. Please wait 1 minute and try again.");
            }
            log.error("AI API call failed: {}", e.getMessage(), e);
            throw e;
        }
    }

    public List<Scheme> getAllSchemes() {
        log.info("Fetching all schemes (including deprecated)");
        List<Scheme> schemes = schemeRepository.findAll();
        log.info("Returning {} total schemes (active + deprecated)", schemes.size());
        return schemes;
    }
}

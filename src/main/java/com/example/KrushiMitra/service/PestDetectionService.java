package com.example.KrushiMitra.service;

import com.example.KrushiMitra.dto.PestDetectionResponse;
import com.example.KrushiMitra.entity.PestReport;
import com.example.KrushiMitra.entity.User;
import com.example.KrushiMitra.repository.PestReportRepository;
import com.example.KrushiMitra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PestDetectionService {

    private final PestReportRepository pestReportRepository;
    private final UserRepository userRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final SmsService smsService;

    @Value("${ai.api.url}")
    private String aiApiUrl;

    @Value("${ai.api.key}")
    private String aiApiKey;

    public PestDetectionResponse detectPest(MultipartFile imageFile,
                                            String cropType) throws Exception {
        // Get logged in user
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Convert image to Base64
        String base64Image = Base64.getEncoder()
                .encodeToString(imageFile.getBytes());
        String mimeType = imageFile.getContentType() != null
                ? imageFile.getContentType() : "image/jpeg";

        // Build Gemini API request
        // Gemini accepts: { contents: [{ parts: [{ text }, { inlineData }] }] }
        Map<String, Object> textPart = Map.of(
                "text", buildPestPrompt(cropType, user.getPreferredLanguage())
        );
        Map<String, Object> imagePart = Map.of(
                "inlineData", Map.of(
                        "mimeType", mimeType,
                        "data", base64Image
                )
        );
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(textPart, imagePart))
                )
        );

        // Call Gemini API
        String url = aiApiUrl + "?key=" + aiApiKey;
        String responseBody = webClient.post()
                .uri(url)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // Parse Gemini response
        // Response format: candidates[0].content.parts[0].text
        JsonNode root = objectMapper.readTree(responseBody);
        String aiText = root
                .path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text").asText();

        // Extract fields from AI response
        String pestName   = extractField(aiText, "PEST_NAME");
        String confStr    = extractField(aiText, "CONFIDENCE")
                .replace("%", "").trim();
        double confidence = 0.0;
        try { confidence = Double.parseDouble(confStr); }
        catch (Exception ignored) { confidence = 80.0; }
        String treatment  = extractField(aiText, "TREATMENT");

        // Save to DB
        PestReport report = new PestReport();
        report.setUser(user);
        report.setCropType(cropType);
        report.setPestName(pestName);
        report.setConfidencePercent(confidence);
        report.setTreatmentRecommendation(treatment);
        report.setState(user.getState());
        report.setDistrict(user.getDistrict());

        PestReport saved = pestReportRepository.save(report);


// 🔔 Send SMS alert to farmer
        try {
            smsService.sendSms(
                    user.getPhone(),
                    "⚠ krishidrishti Alert\n" +
                            "Pest detected: " + pestName +
                            "\nCrop: " + cropType +
                            "\nTreatment: " + treatment
            );
        } catch (Exception e) {
            System.out.println("SMS sending failed: " + e.getMessage());
        }
        // Check district alert
        String alert = checkDistrictAlert(user.getDistrict(), pestName);

        return PestDetectionResponse.builder()
                .reportId(saved.getId())
                .pestName(pestName)
                .confidencePercent(confidence)
                .treatmentRecommendation(treatment)
                .districtAlert(alert)
                .build();
    }

    private String buildPestPrompt(String cropType, String lang) {
        String langNote = "mr".equals(lang)
                ? "Respond in Marathi language."
                : "Respond in English.";
        return """
            You are an agricultural expert AI.
            Analyze this crop image and identify any pest or disease.
            Crop type: %s
            %s

            Reply ONLY in this exact format, nothing else:
            PEST_NAME: <name of pest/disease or Healthy>
            CONFIDENCE: <number between 0-100>%%
            TREATMENT: <2-3 sentence treatment recommendation>
            """.formatted(cropType, langNote);
    }

    private String extractField(String text, String field) {
        if (text == null) return "Unknown";
        for (String line : text.split("\n")) {
            line = line.trim();
            if (line.startsWith(field + ":")) {
                return line.substring(field.length() + 1).trim();
            }
        }
        return "Unknown";
    }

    private String checkDistrictAlert(String district, String pestName) {
        List<Object[]> top = pestReportRepository.findTopPestsByDistrict(district);
        for (Object[] row : top) {
            if (row[0].equals(pestName) && ((Long) row[1]) >= 3) {
                return "⚠️ Alert: Multiple cases of " + pestName
                        + " reported in " + district + " district.";
            }
        }
        return null;
    }

    public List<PestReport> getUserHistory(Long userId) {
        return pestReportRepository.findByUserIdOrderByReportedAtDesc(userId);
    }
}
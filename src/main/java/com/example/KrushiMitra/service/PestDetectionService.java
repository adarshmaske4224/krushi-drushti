package com.example.KrushiMitra.service;

import com.example.KrushiMitra.dto.PestDetectionResponse;
import com.example.KrushiMitra.entity.PestReport;
import com.example.KrushiMitra.entity.User;
import com.example.KrushiMitra.repository.PestReportRepository;
import com.example.KrushiMitra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.security.MessageDigest;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PestDetectionService {

        private final PestReportRepository pestReportRepository;
        private final UserRepository userRepository;
        private final WebClient webClient;
        private final ObjectMapper objectMapper;
        private final SmsService smsService;

        @Value("${gemini.vision.url}")
        private String geminiVisionUrl;

        @Value("${gemini.vision.key}")
        private String geminiVisionKey;

        // In-memory cache: image hash -> previous detection result
        private final ConcurrentHashMap<String, PestDetectionResponse> imageCache = new ConcurrentHashMap<>();

        public PestDetectionResponse detectPest(MultipartFile imageFile,
                        String cropType) throws Exception {
                // Get logged in user
                String email = SecurityContextHolder.getContext()
                                .getAuthentication().getName();
                log.info("Pest detection request — user: {}, cropType: {}, imageSize: {} bytes",
                        email, cropType, imageFile.getSize());

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> {
                                    log.error("Pest detection — user not found: {}", email);
                                    return new RuntimeException("User not found");
                                });

                // Compute image hash to check cache
                byte[] imageBytes = imageFile.getBytes();
                String imageHash = computeHash(imageBytes, cropType);

                // Check if we already processed this exact image+cropType
                PestDetectionResponse cachedResult = imageCache.get(imageHash);
                if (cachedResult != null) {
                        log.info("Cache HIT — returning cached pest detection for image hash: {}", imageHash);

                        // Still save a new report in DB for history tracking
                        PestReport report = new PestReport();
                        report.setUser(user);
                        report.setCropType(cropType);
                        report.setPestName(cachedResult.getPestName());
                        report.setConfidencePercent(cachedResult.getConfidencePercent());
                        report.setTreatmentRecommendation(cachedResult.getTreatmentRecommendation());
                        report.setState(user.getState());
                        report.setDistrict(user.getDistrict());
                        PestReport saved = pestReportRepository.save(report);
                        log.info("Cached result saved as new report — ID: {}", saved.getId());

                        // Return a copy with the new report ID
                        return PestDetectionResponse.builder()
                                        .reportId(saved.getId())
                                        .pestName(cachedResult.getPestName())
                                        .confidencePercent(cachedResult.getConfidencePercent())
                                        .treatmentRecommendation(cachedResult.getTreatmentRecommendation())
                                        .districtAlert(checkDistrictAlert(user.getDistrict(), cachedResult.getPestName()))
                                        .build();
                }

                log.info("Cache MISS — calling AI for pest detection, hash: {}", imageHash);

                // Convert image to Base64
                String base64Image = Base64.getEncoder().encodeToString(imageBytes);
                String mimeType = imageFile.getContentType() != null
                                ? imageFile.getContentType()
                                : "image/jpeg";
                log.debug("Image encoded to Base64 — mimeType: {}, base64 length: {}", mimeType, base64Image.length());

                // Build Gemini Vision API request
                Map<String, Object> textPart = Map.of(
                                "text", buildPestPrompt(cropType, user.getPreferredLanguage()));
                Map<String, Object> imagePart = Map.of(
                                "inlineData", Map.of(
                                                "mimeType", mimeType,
                                                "data", base64Image));
                Map<String, Object> requestBody = Map.of(
                                "contents", List.of(
                                                Map.of("parts", List.of(textPart, imagePart))));

                // Call Gemini API
                String url = geminiVisionUrl + "?key=" + geminiVisionKey;
                log.debug("Calling Gemini Vision API for pest detection");
                String responseBody = webClient.post()
                                .uri(url)
                                .header("Content-Type", "application/json")
                                .bodyValue(requestBody)
                                .retrieve()
                                .bodyToMono(String.class)
                                .block();
                log.debug("Gemini Vision response received, length: {}", responseBody != null ? responseBody.length() : 0);

                // Parse Gemini response
                JsonNode root = objectMapper.readTree(responseBody);
                String aiText = root
                                .path("candidates").get(0)
                                .path("content")
                                .path("parts").get(0)
                                .path("text").asText();
                log.debug("Gemini AI text response: {}", aiText);

                // Extract fields from AI response
                String pestName = extractField(aiText, "PEST_NAME");
                String confStr = extractField(aiText, "CONFIDENCE")
                                .replace("%", "").trim();
                double confidence = 0.0;
                try {
                        confidence = Double.parseDouble(confStr);
                } catch (Exception e) {
                        log.warn("Could not parse confidence '{}', defaulting to 80.0", confStr);
                        confidence = 80.0;
                }
                String treatment = extractField(aiText, "TREATMENT");
                log.info("Pest detected: {} | confidence: {}% | cropType: {}", pestName, confidence, cropType);

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
                log.info("Pest report saved — ID: {}, pest: {}, district: {}", saved.getId(), pestName, user.getDistrict());

                // Build response
                PestDetectionResponse result = PestDetectionResponse.builder()
                                .reportId(saved.getId())
                                .pestName(pestName)
                                .confidencePercent(confidence)
                                .treatmentRecommendation(treatment)
                                .districtAlert(checkDistrictAlert(user.getDistrict(), pestName))
                                .build();

                // Cache the result for this image hash
                imageCache.put(imageHash, result);
                log.info("Cached pest detection result for image hash: {} (cache size: {})", imageHash, imageCache.size());

                // Send SMS alert to farmer
                try {
                        smsService.sendSms(
                                        user,
                                        "⚠ krishidrishti Alert\n" +
                                                        "Pest detected: " + pestName +
                                                        "\nCrop: " + cropType +
                                                        "\nTreatment: " + treatment,
                                        "PEST_OUTBREAK");
                        log.info("SMS alert sent to farmer: {} for pest: {}", user.getPhone(), pestName);
                } catch (Exception e) {
                        log.error("SMS sending failed for user {}: {}", user.getEmail(), e.getMessage(), e);
                }

                if (result.getDistrictAlert() != null) {
                    log.warn("District alert triggered — {}", result.getDistrictAlert());
                }

                return result;
        }

        /**
         * Computes a SHA-256 hash of the image bytes + crop type to use as cache key.
         */
        private String computeHash(byte[] imageBytes, String cropType) {
                try {
                        MessageDigest digest = MessageDigest.getInstance("SHA-256");
                        digest.update(imageBytes);
                        digest.update(cropType.getBytes());
                        byte[] hash = digest.digest();
                        StringBuilder hexString = new StringBuilder();
                        for (byte b : hash) {
                                String hex = Integer.toHexString(0xff & b);
                                if (hex.length() == 1) hexString.append('0');
                                hexString.append(hex);
                        }
                        return hexString.toString();
                } catch (Exception e) {
                        log.error("Failed to compute image hash, returning fallback key", e);
                        return "fallback-" + imageBytes.length + "-" + cropType;
                }
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
                if (text == null)
                        return "Unknown";
                for (String line : text.split("\n")) {
                        line = line.trim();
                        if (line.startsWith(field + ":")) {
                                return line.substring(field.length() + 1).trim();
                        }
                }
                log.warn("Could not extract field '{}' from AI response", field);
                return "Unknown";
        }

        private String checkDistrictAlert(String district, String pestName) {
                log.debug("Checking district alert for {} in {}", pestName, district);
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
                log.debug("Fetching pest history for userId: {}", userId);
                List<PestReport> history = pestReportRepository.findByUserIdOrderByReportedAtDesc(userId);
                log.debug("Found {} pest reports for userId: {}", history.size(), userId);
                return history;
        }
}
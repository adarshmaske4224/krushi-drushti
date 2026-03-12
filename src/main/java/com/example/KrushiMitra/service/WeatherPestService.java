package com.example.KrushiMitra.service;

import com.example.KrushiMitra.dto.WeatherPestPredictionResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.example.KrushiMitra.repository.UserRepository;
import com.example.KrushiMitra.entity.User;
import com.example.KrushiMitra.service.SmsService;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherPestService {

        private final WebClient webClient;
        private final ObjectMapper objectMapper;
        private final SmsService smsService;
        private final UserRepository userRepository;

        @Value("${weather.api.url}")
        private String weatherApiUrl;

        @Value("${ai.api.url}")
        private String aiApiUrl;

        @Value("${ai.api.key}")
        private String aiApiKey;

        public WeatherPestPredictionResponse predictPests(
                        String district,
                        String state,
                        String cropType) throws Exception {

                log.info("Pest prediction request — district: {}, state: {}, cropType: {}", district, state, cropType);

                double[] coords = getCoordinatesForDistrict(district);
                double lat = coords[0];
                double lon = coords[1];
                log.debug("Coordinates for {}: lat={}, lon={}", district, lat, lon);

                String weatherUrl = UriComponentsBuilder
                                .fromHttpUrl(weatherApiUrl)
                                .queryParam("latitude", lat)
                                .queryParam("longitude", lon)
                                .queryParam("current",
                                                "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code")
                                .queryParam("timezone", "Asia/Kolkata")
                                .toUriString();

                log.debug("Fetching weather data from Open-Meteo");
                String weatherResponse = webClient.get()
                                .uri(weatherUrl)
                                .retrieve()
                                .bodyToMono(String.class)
                                .block();

                JsonNode root = objectMapper.readTree(weatherResponse);
                JsonNode current = root.path("current");

                double temperature = current.path("temperature_2m").asDouble();
                double humidity = current.path("relative_humidity_2m").asDouble();
                double rainfall = current.path("precipitation").asDouble();
                double windSpeed = current.path("wind_speed_10m").asDouble();
                int weatherCode = current.path("weather_code").asInt();
                String weatherCondition = mapWeatherCode(weatherCode);
                String season = getSeason();

                log.info("Weather data — temp: {}°C, humidity: {}%, rainfall: {}mm, wind: {}km/h, condition: {}, season: {}",
                        temperature, humidity, rainfall, windSpeed, weatherCondition, season);

                try {

                        String prompt = """
                                        You are an agricultural expert.

                                        Weather Conditions:
                                        Temperature: %s°C
                                        Humidity: %s%%
                                        Rainfall: %s mm
                                        Crop: %s

                                        Predict pests likely in next 7 days.

                                        Respond JSON:
                                        {
                                          "overallRiskLevel": "HIGH",
                                          "generalAdvice": "text",
                                          "predictions":[
                                            {
                                              "pestName":"name",
                                              "riskLevel":"HIGH",
                                              "reason":"reason",
                                              "preventiveMeasure":"solution"
                                            }
                                          ]
                                        }
                                        """.formatted(temperature, humidity, rainfall, cropType);

                        Map<String, Object> body = Map.of(
                                        "model", "llama-3.1-8b-instant",
                                        "messages", List.of(
                                                        Map.of("role", "user", "content", prompt)));

                        String aiUrl = aiApiUrl;

                        log.debug("Calling Groq AI for pest prediction");
                        String aiResponse = webClient.post()
                                        .uri(aiUrl)
                                        .header("Content-Type", "application/json")
                                        .header("Authorization", "Bearer " + aiApiKey)
                                        .bodyValue(body)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block();

                        JsonNode aiRoot = objectMapper.readTree(aiResponse);

                        String aiText = aiRoot
                                        .path("choices").get(0)
                                        .path("message")
                                        .path("content").asText();

                        String cleanJson = aiText.replace("```json", "")
                                        .replace("```", "")
                                        .trim();

                        JsonNode aiJson = objectMapper.readTree(cleanJson);

                        WeatherPestPredictionResponse response = new WeatherPestPredictionResponse();

                        response.setOverallRiskLevel(
                                        aiJson.path("overallRiskLevel").asText());

                        response.setGeneralAdvice(
                                        aiJson.path("generalAdvice").asText());

                        response.setTemperature(temperature);
                        response.setHumidity(humidity);
                        response.setRainfall(rainfall);
                        response.setWindSpeed(windSpeed);
                        response.setWeatherCondition(weatherCondition);
                        response.setSeason(season);

                        log.info("AI pest prediction — risk: {}, predictions count: {}",
                                response.getOverallRiskLevel(),
                                aiJson.path("predictions").size());

                        if ("HIGH".equalsIgnoreCase(response.getOverallRiskLevel())) {
                                log.warn("HIGH pest risk detected for district: {}, crop: {}", district, cropType);

                                User user = userRepository.findByDistrict(district).stream().findFirst().orElse(null);
                                if (user != null) {
                                        smsService.sendSms(
                                                        user,
                                                        "⚠ krishidrishti Weather Alert\n" +
                                                                        "High pest risk detected for crop: " + cropType +
                                                                        "\nInspect your crops immediately.", "WEATHER_ALERT");
                                        log.info("Weather alert SMS sent to user in district: {}", district);
                                } else {
                                        log.warn("No user found in district {} to send weather alert SMS", district);
                                }
                        }

                        return response;

                } catch (Exception e) {

                        log.warn("Groq AI pest prediction failed, using fallback — error: {}", e.getMessage(), e);

                        return fallbackPrediction(
                                        temperature,
                                        humidity,
                                        rainfall,
                                        windSpeed,
                                        weatherCondition,
                                        season,
                                        cropType);
                }
        }

        private WeatherPestPredictionResponse fallbackPrediction(
                        double temperature,
                        double humidity,
                        double rainfall,
                        double windSpeed,
                        String weatherCondition,
                        String season,
                        String cropType) {

                log.info("Generating fallback pest prediction — temp: {}°C, humidity: {}%, rainfall: {}mm",
                        temperature, humidity, rainfall);

                WeatherPestPredictionResponse response = new WeatherPestPredictionResponse();

                String risk = "LOW";
                String pest = "कोणतीही कीड नाही (None)";
                String reason = "सध्याचे हवामान प्रमुख किडींसाठी अनुकूल नाही.";
                String prevention = "पिकाची नियमित तपासणी करा.";

                // Random element to add variety
                int randomFactor = (int) (Math.random() * 3);

                if (humidity > 70 && temperature >= 20 && temperature <= 32) {
                        risk = "HIGH";
                        if (randomFactor == 0) {
                                pest = "मावा / करपा (Aphids / Fungal)";
                                reason = "जास्त आर्द्रता आणि मध्यम तापमान मावा आणि बुरशीच्या वाढीस अनुकूल आहे.";
                                prevention = "निम अर्क किंवा योग्य बुरशीनाशकाची फवारणी करा.";
                        } else if (randomFactor == 1) {
                                pest = "पांढरी माशी (Whitefly)";
                                reason = "दमट हवामानामुळे पांढऱ्या माशीचा प्रादुर्भाव वाढू शकतो.";
                                prevention = "पिवळे चिकट सापळे लावा आणि योग्य कीटकनाशक वापरा.";
                        } else {
                                pest = "अळी (Caterpillar / Armyworm)";
                                reason = "सध्याचे हवामान अळीच्या प्रजननास अनुकूल आहे.";
                                prevention = "जैविक कीटकनाशकांची फवारणी करा.";
                        }
                }

                else if (rainfall > 5) {
                        risk = "MEDIUM";
                        if (randomFactor == 0) {
                                pest = "मूळकूज / जिवाणू करपा (Root Rot / Bacterial Blight)";
                                reason = "जास्त पावसामुळे आणि पाणी साचल्यामुळे मुळांचे आजार होऊ शकतात.";
                                prevention = "शेतातील पाण्याचा निचरा सुधारा आणि कॉपर आधारित औषधे वापरा.";
                        } else {
                                pest = "खोडकिडा (Stem Borer)";
                                reason = "पावसाळी वातावरणात खोडकिड्याचा प्रादुर्भाव दिसू शकतो.";
                                prevention = "प्रादुर्भावग्रस्त झाडे नष्ट करा.";
                        }
                }

                else if (temperature > 32 && humidity < 50) {
                        risk = "MEDIUM";
                        if (randomFactor == 0) {
                                pest = "लाल कोळी / फुलकिडे (Spider Mites / Thrips)";
                                reason = "उष्ण आणि कोरड्या हवामानामुळे कोळी आणि फुलकिड्यांचा प्रादुर्भाव वाढतो.";
                                prevention = "पानांवर पाण्याचा फवारा मारा किंवा योग्य औषध वापरा.";
                        } else {
                                pest = "पिठ्या ढेकूण (Mealybug)";
                                reason = "कोरड्या हवामानात पिठ्या ढेकूण वेगाने पसरतो.";
                                prevention = "साबणाचे पाणी किंवा निम अर्काची फवारणी करा.";
                        }
                } else {
                        // Default general risk if nothing else matches strongly
                        risk = "LOW";
                        pest = "किरकोळ कीड (Minor Pests)";
                        reason = "हवामान सामान्य आहे, मोठा धोका नाही.";
                        prevention = "प्रतिबंधात्मक उपाय म्हणून निम अर्काची फवारणी करू शकता.";
                }

                log.info("Fallback prediction — risk: {}, pest: {}", risk, pest);

                WeatherPestPredictionResponse.PestPrediction prediction = WeatherPestPredictionResponse.PestPrediction
                                .builder()
                                .pestName(pest)
                                .riskLevel(risk)
                                .reason(reason)
                                .preventiveMeasure(prevention)
                                .build();

                response.setOverallRiskLevel(risk);
                response.setGeneralAdvice("पिकाच्या आरोग्यावर नियमित लक्ष ठेवा. (Monitor crop health regularly)");
                response.setPredictions(List.of(prediction));
                response.setTemperature(temperature);
                response.setHumidity(humidity);
                response.setRainfall(rainfall);
                response.setWindSpeed(windSpeed);
                response.setWeatherCondition(weatherCondition);
                response.setSeason(season);

                return response;
        }

        private String mapWeatherCode(int code) {
                if (code == 0)
                        return "Clear sky";
                if (code <= 3)
                        return "Partly cloudy";
                if (code <= 48)
                        return "Foggy";
                if (code <= 57)
                        return "Drizzle";
                if (code <= 67)
                        return "Rain";
                if (code <= 77)
                        return "Snow";
                if (code <= 82)
                        return "Showers";
                if (code <= 99)
                        return "Thunderstorm";
                return "Unknown";
        }

        private String getSeason() {
                int month = java.time.LocalDate.now().getMonthValue();
                if (month >= 6 && month <= 9)
                        return "Kharif Season (Monsoon)";
                if (month >= 10 || month <= 2)
                        return "Rabi Season (Winter)";
                return "Zaid Season (Summer)";
        }

        private double[] getCoordinatesForDistrict(String district) {
                log.debug("Geocoding district: {}", district);
                try {
                        String geoUrl = UriComponentsBuilder
                                        .fromHttpUrl("https://geocoding-api.open-meteo.com/v1/search")
                                        .queryParam("name", district)
                                        .queryParam("count", 1)
                                        .queryParam("language", "en")
                                        .queryParam("format", "json")
                                        .toUriString();

                        String geoResponse = webClient.get()
                                        .uri(geoUrl)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block();

                        JsonNode root = objectMapper.readTree(geoResponse);
                        if (root.has("results") && root.path("results").isArray() && root.path("results").size() > 0) {
                                JsonNode firstResult = root.path("results").get(0);
                                double lat = firstResult.path("latitude").asDouble();
                                double lon = firstResult.path("longitude").asDouble();
                                log.debug("Geocoded {} to lat: {}, lon: {}", district, lat, lon);
                                return new double[] { lat, lon };
                        }
                        log.warn("No geocoding results found for district: {}", district);
                } catch (Exception e) {
                        log.error("Failed to geocode district: {} — using Pune default coordinates. Error: {}",
                                district, e.getMessage(), e);
                }
                // Default to Pune coordinates if not found
                return new double[] { 18.5204, 73.8567 };
        }
}
package com.example.KrushiMitra.service;

import com.example.KrushiMitra.dto.WeatherPestPredictionResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WeatherPestService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final SmsService smsService;

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

        double lat = 18.5204;
        double lon = 73.8567;

        String weatherUrl = UriComponentsBuilder
                .fromHttpUrl(weatherApiUrl)
                .queryParam("latitude", lat)
                .queryParam("longitude", lon)
                .queryParam("current",
                        "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code")
                .queryParam("timezone", "Asia/Kolkata")
                .toUriString();

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
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            String aiUrl = aiApiUrl + "?key=" + aiApiKey;

            String aiResponse = webClient.post()
                    .uri(aiUrl)
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode aiRoot = objectMapper.readTree(aiResponse);

            String aiText = aiRoot
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text").asText();

            String cleanJson = aiText.replace("```json", "")
                    .replace("```", "")
                    .trim();

            JsonNode aiJson = objectMapper.readTree(cleanJson);

            WeatherPestPredictionResponse response =
                    new WeatherPestPredictionResponse();

            response.setOverallRiskLevel(
                    aiJson.path("overallRiskLevel").asText());

            response.setGeneralAdvice(
                    aiJson.path("generalAdvice").asText());

            if ("HIGH".equalsIgnoreCase(response.getOverallRiskLevel())) {

                smsService.sendSms(
                        "+91XXXXXXXXXX",
                        "⚠ krishidrishti Weather Alert\n" +
                                "High pest risk detected for crop: " + cropType +
                                "\nInspect your crops immediately."
                );
            }

            return response;

        } catch (Exception e) {

            System.out.println("Gemini failed, using fallback prediction");

            return fallbackPrediction(
                    temperature,
                    humidity,
                    rainfall,
                    cropType
            );
        }
    }

    private WeatherPestPredictionResponse fallbackPrediction(
            double temperature,
            double humidity,
            double rainfall,
            String cropType) {

        WeatherPestPredictionResponse response = new WeatherPestPredictionResponse();

        String risk = "LOW";
        String pest = "None";
        String reason = "Weather conditions are not favorable for major pests.";
        String prevention = "Monitor crop regularly.";

        if (humidity > 80 && temperature >= 20 && temperature <= 30) {
            risk = "HIGH";
            pest = "Aphids / Fungal Diseases";
            reason = "High humidity and moderate temperature favor aphids and fungal growth.";
            prevention = "Use neem oil spray or fungicide.";
        }

        else if (rainfall > 10) {
            risk = "MEDIUM";
            pest = "Root Rot / Bacterial Blight";
            reason = "Excess rainfall can cause root diseases.";
            prevention = "Improve soil drainage.";
        }

        else if (temperature > 35 && humidity < 40) {
            risk = "MEDIUM";
            pest = "Spider Mites / Thrips";
            reason = "Hot and dry weather encourages mites and thrips.";
            prevention = "Spray water on leaves.";
        }

        WeatherPestPredictionResponse.PestPrediction prediction =
                WeatherPestPredictionResponse.PestPrediction.builder()
                        .pestName(pest)
                        .riskLevel(risk)
                        .reason(reason)
                        .preventiveMeasure(prevention)
                        .build();

        response.setOverallRiskLevel(risk);
        response.setGeneralAdvice("Monitor crop health regularly.");
        response.setPredictions(List.of(prediction));

        return response;
    }
}
package com.example.KrushiMitra.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.api.url}")
    private String aiApiUrl;

    @Value("${ai.api.key}")
    private String aiApiKey;

    public String askGemini(String question, String lang) throws Exception {
        String langNote = "mr".equalsIgnoreCase(lang) ? "Marathi" : "English";
        String prompt = "You are 'KrishiDrishti AI Crop Doctor', a highly knowledgeable and friendly agricultural expert in India. "
                + "A farmer has asked you a question. Please answer their question accurately and concisely, offering practical farming advice. "
                + "Respond entirely in " + langNote + ".\n\n"
                + "Farmer's question: " + question;

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(textPart))));

        String url = aiApiUrl + "?key=" + aiApiKey;
        String responseBody;
        try {
            responseBody = webClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            System.err.println("Gemini Error Response: " + e.getResponseBodyAsString());
            throw e;
        }

        JsonNode root = objectMapper.readTree(responseBody);
        return root.path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text").asText();
    }
}

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
                String prompt = "You are 'KrishiDrishti AI Crop Doctor', an expert agricultural advisor in Maharashtra, India. "
                                + "A farmer is asking you a question. They might type Marathi in English alphabet (Hinglish/Latin script). "
                                + "You must understand their question but reply with a helpful, friendly, and practical answer. "
                                + "Respond ONLY in " + langNote + ". "
                                + ("mr".equalsIgnoreCase(lang)
                                                ? "CRITICAL RULE: Your complete response MUST BE strictly written in proper Devanagari Marathi script (मराठी लिपी). Do NOT use English alphabets in your response."
                                                : "")
                                + "\n\nFarmer's Question: " + question;

                Map<String, Object> requestBody = Map.of(
                                "model", "llama-3.1-8b-instant",
                                "messages", List.of(
                                                Map.of("role", "user", "content", prompt)));

                String url = aiApiUrl;
                String responseBody;
                try {
                        responseBody = webClient.post()
                                        .uri(url)
                                        .header("Content-Type", "application/json")
                                        .header("Authorization", "Bearer " + aiApiKey)
                                        .bodyValue(requestBody)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block();
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        System.err.println("Gemini Error Response: " + e.getResponseBodyAsString());
                        throw e;
                }

                JsonNode root = objectMapper.readTree(responseBody);
                return root.path("choices").get(0)
                                .path("message")
                                .path("content").asText();
        }
}

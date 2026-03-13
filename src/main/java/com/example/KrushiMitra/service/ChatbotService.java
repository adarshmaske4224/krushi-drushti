package com.example.KrushiMitra.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

        private final WebClient webClient;
        private final ObjectMapper objectMapper;

        @Value("${ai.api.url}")
        private String aiApiUrl;

        @Value("${ai.api.key}")
        private String aiApiKey;

        @Value("${ai.api.model:llama-3.3-70b-versatile}")
        private String aiApiModel;

        public String askGemini(String question, String lang) throws Exception {
                log.info("Chatbot query received — lang: {}, question length: {}", lang, question != null ? question.length() : 0);
                log.debug("Chatbot question: {}", question);

                String langNote = "mr".equalsIgnoreCase(lang) ? "Marathi" : "English";
                
                StringBuilder promptBuilder = new StringBuilder();
                promptBuilder.append("You are 'KrishiDrishti AI Crop Doctor', a highly experienced agricultural consultant specializing in farming in Maharashtra, India.\n\n");
                promptBuilder.append("OBJECTIVE: Provide practical, scientifically sound, and empathetic advice to farmers. Keep instructions clear and actionable.\n");
                promptBuilder.append("LANGUAGE RULES:\n");
                promptBuilder.append("- Respond ONLY in ").append(langNote).append(".\n");
                
                if ("mr".equalsIgnoreCase(lang)) {
                    promptBuilder.append("- Write strictly in Devanagari Marathi script.\n");
                    promptBuilder.append("- You MAY use English technical terms (like 'NPK', 'Urea', 'pesticide', 'fungus') in parentheses next to Marathi terms if it helps clarity.\n");
                    promptBuilder.append("- Maintain a respectful and helpful tone suitable for a farmer (बळीराजा).\n");
                } else {
                    promptBuilder.append("- Use simple, professional English.\n");
                }
                
                promptBuilder.append("\nFarmer's Question/Context:\n").append(question);

                String prompt = promptBuilder.toString();

                Map<String, Object> requestBody = Map.of(
                                "model", aiApiModel,
                                "messages", List.of(
                                                Map.of("role", "system", "content", "You are a helpful agricultural advisor for Maharashtra farmers."),
                                                Map.of("role", "user", "content", prompt)));

                String url = aiApiUrl;
                String responseBody;
                try {
                        log.debug("Calling Groq AI for chatbot response");
                        responseBody = webClient.post()
                                        .uri(url)
                                        .header("Content-Type", "application/json")
                                        .header("Authorization", "Bearer " + aiApiKey)
                                        .bodyValue(requestBody)
                                        .retrieve()
                                        .bodyToMono(String.class)
                                        .block();
                        log.debug("Groq AI raw response received, length: {}", responseBody != null ? responseBody.length() : 0);
                } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                        log.error("Groq AI API error — status: {}, body: {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
                        throw e;
                }

                JsonNode root = objectMapper.readTree(responseBody);
                String answer = root.path("choices").get(0)
                                .path("message")
                                .path("content").asText();
                log.info("Chatbot response generated — answer length: {} chars", answer.length());
                return answer;
        }
}

package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/ask")
    public ResponseEntity<?> askQuestion(@RequestBody Map<String, String> request) {
        try {
            String question = request.get("question");
            String lang = request.getOrDefault("language", "mr");
            log.info("POST /api/chat/ask — lang: {}, question: {}", lang, question);
            String answer = chatbotService.askGemini(question, lang);
            log.info("Chatbot response sent — answer length: {} chars", answer.length());
            return ResponseEntity.ok(Map.of("answer", answer));
        } catch (Exception e) {
            log.error("Chatbot error: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error communicating with Crop Doctor AI: " + e.getMessage()));
        }
    }
}

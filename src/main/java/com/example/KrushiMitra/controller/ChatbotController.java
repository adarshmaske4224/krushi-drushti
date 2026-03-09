package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

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
            String answer = chatbotService.askGemini(question, lang);
            return ResponseEntity.ok(Map.of("answer", answer));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error communicating with Crop Doctor AI: " + e.getMessage()));
        }
    }
}

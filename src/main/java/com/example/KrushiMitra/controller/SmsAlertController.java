package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.dto.SmsAlertResponse;
import com.example.KrushiMitra.entity.SmsAlert;
import com.example.KrushiMitra.entity.User;
import com.example.KrushiMitra.repository.SmsAlertRepository;
import com.example.KrushiMitra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/sms")
@RequiredArgsConstructor
public class SmsAlertController {

    private final SmsAlertRepository smsAlertRepository;
    private final UserRepository userRepository;

    @GetMapping("/history")
    public ResponseEntity<List<SmsAlertResponse>> getSmsHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("GET /api/sms/history — user: {}", email);

        User user = userRepository.findByEmail(email).orElseThrow(() -> {
            log.error("User not found for SMS history: {}", email);
            return new RuntimeException("User not found");
        });

        List<SmsAlertResponse> history = smsAlertRepository.findByUserIdOrderBySentAtDesc(user.getId())
                .stream()
                .map(alert -> SmsAlertResponse.builder()
                        .alertId(alert.getId())
                        .alertType(alert.getAlertType())
                        .message(alert.getMessage())
                        .status(alert.getStatus())
                        .sentAt(alert.getSentAt())
                        .build())
                .collect(Collectors.toList());

        log.info("SMS history returned — {} alerts for user: {}", history.size(), email);
        return ResponseEntity.ok(history);
    }
}

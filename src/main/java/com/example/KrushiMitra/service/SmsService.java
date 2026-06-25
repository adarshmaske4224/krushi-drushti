package com.example.KrushiMitra.service;

import com.example.KrushiMitra.entity.SmsAlert;
import com.example.KrushiMitra.entity.User;
import com.example.KrushiMitra.repository.SmsAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmsService {

    private final SmsAlertRepository smsAlertRepository;

    public void sendSms(User user, String message, String alertType) {
        String phone = user.getPhone() != null ? user.getPhone() : "Unknown";
        log.info("Sending SMS to {} [{}] — type: {}", phone, user.getEmail(), alertType);
        log.debug("SMS message content: {}", message);
        
        SmsAlert alert = SmsAlert.builder()
                .user(user)
                .phone(phone)
                .message(message)
                .alertType(alertType)
                .status("SENT")
                .build();
                
        smsAlertRepository.save(alert);
        log.info("SMS alert saved — ID: {}, type: {}, phone: {}", alert.getId(), alertType, phone);
    }
}
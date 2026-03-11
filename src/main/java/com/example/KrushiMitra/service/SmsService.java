package com.example.KrushiMitra.service;

import com.example.KrushiMitra.entity.SmsAlert;
import com.example.KrushiMitra.entity.User;
import com.example.KrushiMitra.repository.SmsAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SmsService {

    private final SmsAlertRepository smsAlertRepository;

    public void sendSms(User user, String message, String alertType) {
        String phone = user.getPhone() != null ? user.getPhone() : "Unknown";
        System.out.println("SMS sent to " + phone + " [" + alertType + "]: " + message);
        
        SmsAlert alert = SmsAlert.builder()
                .user(user)
                .phone(phone)
                .message(message)
                .alertType(alertType)
                .status("SENT")
                .build();
                
        smsAlertRepository.save(alert);
    }
}
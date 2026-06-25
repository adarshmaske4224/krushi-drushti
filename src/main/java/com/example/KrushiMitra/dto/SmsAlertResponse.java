package com.example.KrushiMitra.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmsAlertResponse {
    private Long alertId;
    private String alertType;
    private String message;
    private String status;
    private LocalDateTime sentAt;
}

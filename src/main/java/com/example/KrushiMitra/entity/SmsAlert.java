package com.example.KrushiMitra.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sms_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmsAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String phone;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private String alertType; // e.g. PEST_OUTBREAK, WEATHER_ALERT, PRICE_ALERT, SCHEME_REMINDER

    private String status; // e.g. SENT, FAILED

    @CreationTimestamp
    private LocalDateTime sentAt;
}

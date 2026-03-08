package com.example.KrushiMitra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pest_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor @Builder

public class PestReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String imagePath;
    private String cropType;
    private String pestName;
    private Double confidencePercent;

    @Column(length = 2000)
    private String treatmentRecommendation;

    private String state;
    private String district;

    @Column(nullable = false, updatable = false)
    private LocalDateTime reportedAt;   // ✅ remove inline = LocalDateTime.now()

    @PrePersist
    public void prePersist() {
        this.reportedAt = LocalDateTime.now();
    }
}
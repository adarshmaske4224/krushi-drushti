package com.example.KrushiMitra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scheme_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchemeRecommendation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scheme_id", nullable = false)
    private Scheme scheme;

    @Column(length = 1000)
    private String aiReasoning;

    @Column(nullable = false, updatable = false)
    private LocalDateTime recommendedAt;  // ✅ remove inline = LocalDateTime.now()

    @PrePersist
    public void prePersist() {
        this.recommendedAt = LocalDateTime.now();
    }
}
package com.example.KrushiMitra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "crop_prices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropPrice {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String commodity;
    private String state;
    private String district;
    private String market;
    private Double minPrice;
    private Double maxPrice;
    private Double modalPrice;
    private LocalDate priceDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fetchedAt;   // ✅ remove inline = LocalDateTime.now()

    @PrePersist
    public void prePersist() {
        this.fetchedAt = LocalDateTime.now();
    }
}
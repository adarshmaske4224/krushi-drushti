package com.example.KrushiMitra.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "schemes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scheme {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    private String eligibleStates;   // comma-separated or "ALL"
    private Double maxLandSizeAcres;
    private Double maxAnnualIncome;
    private String eligibleCategories; // "GEN,OBC,SC,ST" or subset
    private String eligibleCrops;    // comma-separated or "ALL"

    @Column(length = 1000)
    private String benefits;

    private String applicationUrl;
    private Boolean isActive = true;
}
package com.example.KrushiMitra.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "crop_information")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "crop_name", nullable = false)
    private String cropName;

    private String category;

    private String season;

    @Column(name = "soil_type")
    private String soilType;

    @Column(name = "temp_min")
    private Double tempMin;

    @Column(name = "temp_max")
    private Double tempMax;

    @Column(name = "rainfall_min")
    private Double rainfallMin;

    @Column(name = "rainfall_max")
    private Double rainfallMax;

    @Column(name = "water_requirement")
    private String waterRequirement;

    @Column(name = "growth_days")
    private Integer growthDays;

    @Column(name = "yield_per_acre")
    private Double yieldPerAcre;

    @Column(name = "avg_price")
    private Double avgPrice;

    @Column(name = "avg_cost")
    private Double avgCost;
}

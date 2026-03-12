package com.example.KrushiMitra.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "district_climate")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistrictClimate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "district_name", nullable = false)
    private String districtName;

    @Column(name = "rainfall_min")
    private Double rainfallMin;

    @Column(name = "rainfall_max")
    private Double rainfallMax;

    @Column(name = "temp_min")
    private Double tempMin;

    @Column(name = "temp_max")
    private Double tempMax;

    @Column(name = "humidity_min")
    private Double humidityMin;

    @Column(name = "humidity_max")
    private Double humidityMax;

    @Column(name = "wind_min")
    private Double windMin;

    @Column(name = "wind_max")
    private Double windMax;

    @Column(name = "climate_type")
    private String climateType;

    @Column(name = "soil_type")
    private String soilType;

    @Column(name = "water_source")
    private String waterSource;
}

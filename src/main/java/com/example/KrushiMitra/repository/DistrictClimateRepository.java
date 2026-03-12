package com.example.KrushiMitra.repository;

import com.example.KrushiMitra.entity.DistrictClimate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DistrictClimateRepository extends JpaRepository<DistrictClimate, Long> {

    Optional<DistrictClimate> findByDistrictNameIgnoreCase(String districtName);
}

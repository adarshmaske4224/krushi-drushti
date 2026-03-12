package com.example.KrushiMitra.repository;

import com.example.KrushiMitra.entity.CropInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropRepository extends JpaRepository<CropInformation, Long> {

    List<CropInformation> findBySeason(String season);

    List<CropInformation> findBySoilType(String soilType);

    List<CropInformation> findByCategory(String category);
}

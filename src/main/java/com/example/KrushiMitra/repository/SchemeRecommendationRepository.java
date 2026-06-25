package com.example.KrushiMitra.repository;


import com.example.KrushiMitra.entity.SchemeRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SchemeRecommendationRepository extends JpaRepository<SchemeRecommendation, Long> {
    List<SchemeRecommendation> findByUserIdOrderByRecommendedAtDesc(Long userId);
}
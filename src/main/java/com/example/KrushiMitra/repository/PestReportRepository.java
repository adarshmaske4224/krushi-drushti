package com.example.KrushiMitra.repository;


import com.example.KrushiMitra.entity.PestReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PestReportRepository extends JpaRepository<PestReport, Long> {
    List<PestReport> findByUserIdOrderByReportedAtDesc(Long userId);
    List<PestReport> findByDistrictOrderByReportedAtDesc(String district);

    @Query("SELECT p.pestName, COUNT(p) as cnt FROM PestReport p WHERE p.district = :district GROUP BY p.pestName ORDER BY cnt DESC")
    List<Object[]> findTopPestsByDistrict(String district);
}
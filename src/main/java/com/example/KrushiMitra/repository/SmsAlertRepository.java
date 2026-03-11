package com.example.KrushiMitra.repository;

import com.example.KrushiMitra.entity.SmsAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SmsAlertRepository extends JpaRepository<SmsAlert, Long> {
    List<SmsAlert> findByUserIdOrderBySentAtDesc(Long userId);
}

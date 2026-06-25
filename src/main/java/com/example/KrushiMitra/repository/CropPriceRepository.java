package com.example.KrushiMitra.repository;

import com.example.KrushiMitra.entity.CropPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface CropPriceRepository extends JpaRepository<CropPrice, Long> {
    List<CropPrice> findByCommodityAndStateAndMarketOrderByPriceDateDesc(
            String commodity, String state, String market);
    List<CropPrice> findByCommodityAndStateAndMarketAndPriceDateBetween(
            String commodity, String state, String market, LocalDate from, LocalDate to);
}
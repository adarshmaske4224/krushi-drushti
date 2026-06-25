package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.dto.FarmerDashboardResponse;
import com.example.KrushiMitra.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public FarmerDashboardResponse getDashboard() {
        log.info("GET /api/dashboard");
        FarmerDashboardResponse response = dashboardService.getDashboard();
        log.info("Dashboard returned — farmer: {}, district: {}, reports: {}",
                response.getFarmerName(), response.getDistrict(), response.getTotalReports());
        return response;
    }
}
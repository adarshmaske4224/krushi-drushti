package com.example.KrushiMitra.controller;

import com.example.KrushiMitra.dto.FarmerDashboardResponse;
import com.example.KrushiMitra.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public FarmerDashboardResponse getDashboard() {
        return dashboardService.getDashboard();
    }
}
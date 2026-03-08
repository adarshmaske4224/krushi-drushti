package com.example.KrushiMitra.service;

import com.example.KrushiMitra.dto.FarmerDashboardResponse;
import com.example.KrushiMitra.entity.PestReport;
import com.example.KrushiMitra.entity.User;
import com.example.KrushiMitra.repository.PestReportRepository;
import com.example.KrushiMitra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final PestReportRepository pestReportRepository;

    public FarmerDashboardResponse getDashboard() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<PestReport> reports =
                pestReportRepository.findByUserIdOrderByReportedAtDesc(user.getId());

        long totalReports = reports.size();

        List<String> recentPests = reports.stream()
                .limit(5)
                .map(PestReport::getPestName)
                .collect(Collectors.toList());

        return FarmerDashboardResponse.builder()
                .farmerName(user.getFullName())
                .district(user.getDistrict())
                .totalReports(totalReports)
                .recentPests(recentPests)
                .weatherRisk("MEDIUM") // can connect to weather service later
                .advisory("Monitor crops regularly.")
                .build();
    }
}
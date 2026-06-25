package com.example.KrushiMitra.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class FarmerDashboardResponse {

    private String farmerName;
    private String district;

    private long totalReports;

    private List<String> recentPests;

    private String weatherRisk;

    private String advisory;
}
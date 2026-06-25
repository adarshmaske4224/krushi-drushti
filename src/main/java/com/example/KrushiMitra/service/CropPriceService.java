package com.example.KrushiMitra.service;

import com.example.KrushiMitra.dto.CropPriceResponse;
import com.example.KrushiMitra.entity.CropPrice;
import com.example.KrushiMitra.repository.CropPriceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class CropPriceService {

    private final CropPriceRepository cropPriceRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${agmarknet.api.url}") private String agmarknetUrl;
    @Value("${agmarknet.api.key}") private String agmarknetKey;

    public CropPriceResponse getCurrentPrice(String commodity,
                                             String state,
                                             String market,
                                             String district) {
        try {
            log.info("=== AGMARKNET API CALL === Commodity: {} | State: {} | Market: {} | District: {}",
                    commodity, state, market, district);

            String responseBody = webClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder
                                .scheme("https")
                                .host("api.data.gov.in")
                                .path("/resource/9ef84268-d588-465a-a308-a864a43d0070")
                                .queryParam("api-key", agmarknetKey)
                                .queryParam("format", "json")
                                .queryParam("filters[commodity]", commodity.trim())
                                .queryParam("filters[state]", state.trim())
                                .queryParam("filters[market]", market.trim())
                                .queryParam("limit", "10")
                                .queryParam("sort[arrival_date]", "desc");

                        // Only add district filter if provided
                        if (district != null && !district.trim().isEmpty()) {
                            builder = builder.queryParam(
                                    "filters[district]", district.trim());
                        }

                        return builder.build();
                    })
                    .header("Accept", "application/json")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.debug("AGMARKNET raw response: {}", responseBody);

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode records = root.path("records");
            int total = root.path("total").asInt();
            log.info("AGMARKNET total matching records: {}", total);

            if (records.isArray() && records.size() > 0) {
                JsonNode latest = records.get(0);

                String commodity_   = latest.path("commodity").asText();
                String state_       = latest.path("state").asText();
                String district_    = latest.path("district").asText();
                String market_      = latest.path("market").asText();
                String variety_     = latest.path("variety").asText();
                String grade_       = latest.path("grade").asText();
                String arrivalDate_ = latest.path("arrival_date").asText();
                double minPrice_    = parsePrice(latest, "min_price");
                double maxPrice_    = parsePrice(latest, "max_price");
                double modalPrice_  = parsePrice(latest, "modal_price");

                log.info("Real price found — Commodity: {} | District: {} | Modal: {}", commodity_, district_, modalPrice_);

                savePriceToDB(commodity_, state_, market_,
                        minPrice_, maxPrice_, modalPrice_);

                List<CropPriceResponse> trend =
                        buildTrend(records, commodity);

                return CropPriceResponse.builder()
                        .commodity(commodity_)
                        .state(state_)
                        .district(district_)
                        .market(market_)
                        .variety(variety_)
                        .grade(grade_)
                        .minPrice(minPrice_)
                        .maxPrice(maxPrice_)
                        .modalPrice(modalPrice_)
                        .arrivalDate(arrivalDate_)
                        .priceDate(LocalDate.now())
                        .weeklyTrend(trend)
                        .build();

            } else {
                log.warn("No records found from AGMARKNET for commodity: {}, state: {}, market: {}", commodity, state, market);
                return getFallbackPrice(commodity, state, market);
            }

        } catch (Exception e) {
            log.error("AGMARKNET API error for commodity: {}, state: {}, market: {} — {}", commodity, state, market, e.getMessage(), e);
            return getFallbackPrice(commodity, state, market);
        }

    }

    // Parse price - handles commas and spaces
    private double parsePrice(JsonNode node, String field) {
        try {
            String val = node.path(field).asText()
                    .replace(",", "")
                    .replace(" ", "")
                    .trim();
            return Double.parseDouble(val);
        } catch (Exception e) {
            log.warn("Failed to parse price field '{}': {}", field, e.getMessage());
            return 0.0;
        }
    }

    // Only include records matching requested commodity
    private List<CropPriceResponse> buildTrend(JsonNode records,
                                               String commodity) {
        List<CropPriceResponse> trend = new ArrayList<>();
        for (JsonNode r : records) {
            // Filter — only same commodity in trend
            if (!r.path("commodity").asText()
                    .equalsIgnoreCase(commodity)) continue;

            trend.add(CropPriceResponse.builder()
                    .commodity(r.path("commodity").asText())
                    .state(r.path("state").asText())
                    .market(r.path("market").asText())
                    .minPrice(parsePrice(r, "min_price"))
                    .maxPrice(parsePrice(r, "max_price"))
                    .modalPrice(parsePrice(r, "modal_price"))
                    .arrivalDate(r.path("arrival_date").asText())
                    .priceDate(LocalDate.now())
                    .build());
        }
        // If less than 2 trend points, fill with mock
        if (trend.size() < 2) {
            log.debug("Insufficient trend data ({} points), generating mock trend for {}", trend.size(), commodity);
            double base = trend.isEmpty() ? getBasePrice(commodity)
                    : trend.get(0).getModalPrice();
            return getMockWeeklyTrend(commodity, "", "", base);
        }
        log.debug("Built trend with {} data points for {}", trend.size(), commodity);
        return trend;
    }


    // Save to DB for caching
    private void savePriceToDB(String commodity, String state,
                               String market, double min,
                               double max, double modal) {
        try {
            CropPrice price = new CropPrice();
            price.setCommodity(commodity);
            price.setState(state);
            price.setMarket(market);
            price.setMinPrice(min);
            price.setMaxPrice(max);
            price.setModalPrice(modal);
            price.setPriceDate(LocalDate.now());
            cropPriceRepository.save(price);
            log.debug("Cached price to DB — {} | modal: {}", commodity, modal);
        } catch (Exception e) {
            log.error("Failed to cache price to DB for {}: {}", commodity, e.getMessage(), e);
        }
    }

    // Fallback chain: DB cache → Mock data
    private CropPriceResponse getFallbackPrice(String commodity,
                                               String state,
                                               String market) {
        // Try DB cache first
        List<CropPrice> cached = cropPriceRepository
                .findByCommodityAndStateAndMarketOrderByPriceDateDesc(
                        commodity, state, market);

        if (!cached.isEmpty()) {
            CropPrice c = cached.get(0);
            log.info("Returning DB cached price for {} (cached on {})", commodity, c.getPriceDate());
            return CropPriceResponse.builder()
                    .commodity(c.getCommodity())
                    .state(c.getState())
                    .market(c.getMarket())
                    .minPrice(c.getMinPrice())
                    .maxPrice(c.getMaxPrice())
                    .modalPrice(c.getModalPrice())
                    .priceDate(c.getPriceDate())
                    .weeklyTrend(getMockWeeklyTrend(
                            commodity, state, market, c.getModalPrice()))
                    .build();
        }

        // Final fallback — mock data
        log.warn("No cached price found, returning mock price data for {}", commodity);
        double base = getBasePrice(commodity);
        return CropPriceResponse.builder()
                .commodity(commodity)
                .state(state)
                .market(market)
                .minPrice(Math.round(base * 0.95 * 100.0) / 100.0)
                .maxPrice(Math.round(base * 1.05 * 100.0) / 100.0)
                .modalPrice(base)
                .priceDate(LocalDate.now())
                .weeklyTrend(getMockWeeklyTrend(commodity, state, market, base))
                .build();
    }

    private double getBasePrice(String commodity) {
        return switch (commodity.toLowerCase()) {
            case "wheat"     -> 2150.0;
            case "rice"      -> 3200.0;
            case "onion"     -> 1800.0;
            case "tomato"    -> 2500.0;
            case "sugarcane" -> 3500.0;
            case "cotton"    -> 6200.0;
            case "soybean"   -> 4100.0;
            case "potato"    -> 1200.0;
            case "maize"     -> 1900.0;
            default          -> 2000.0;
        };
    }

    private List<CropPriceResponse> getMockWeeklyTrend(String commodity,
                                                       String state,
                                                       String market,
                                                       double basePrice) {
        List<CropPriceResponse> trend = new ArrayList<>();
        Random random = new Random();
        for (int i = 6; i >= 0; i--) {
            double variation = (random.nextDouble() - 0.5) * 200;
            double modal = Math.round((basePrice + variation) * 100.0) / 100.0;
            trend.add(CropPriceResponse.builder()
                    .commodity(commodity).state(state).market(market)
                    .minPrice(Math.round(modal * 0.95 * 100.0) / 100.0)
                    .maxPrice(Math.round(modal * 1.05 * 100.0) / 100.0)
                    .modalPrice(modal)
                    .priceDate(LocalDate.now().minusDays(i))
                    .build());
        }
        return trend;
    }
}
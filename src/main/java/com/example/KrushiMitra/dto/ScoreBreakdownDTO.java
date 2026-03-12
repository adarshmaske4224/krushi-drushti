package com.example.KrushiMitra.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreBreakdownDTO {

    private String factor;       // e.g. "Climate Suitability"
    private int maxPoints;       // e.g. 25
    private int scored;          // e.g. 22
    private String reason;       // human-readable explanation
}

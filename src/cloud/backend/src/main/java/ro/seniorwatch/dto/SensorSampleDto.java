package ro.seniorwatch.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorSampleDto {
    @NotNull
    private OffsetDateTime ts;
    private Short puls;
    private Short spo2;
    private BigDecimal temperatura;
    private BigDecimal umiditate;
}

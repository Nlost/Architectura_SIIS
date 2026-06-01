package ro.seniorwatch.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeasurementBatchRequest {
    @NotBlank
    private String batchId;
    @NotNull
    private UUID patientId;
    private String deviceId;
    @NotNull
    private OffsetDateTime intervalStart;
    @NotNull
    private OffsetDateTime intervalEnd;
    @NotNull @Valid
    private List<SensorSampleDto> samples;
}

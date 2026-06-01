package ro.seniorwatch.dto;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeasurementBatchResponse {
    private String batchId;
    private UUID patientId;
    private String deviceId;
    private OffsetDateTime intervalStart;
    private OffsetDateTime intervalEnd;
    private OffsetDateTime receivedAt;
    private int sampleCount;
}

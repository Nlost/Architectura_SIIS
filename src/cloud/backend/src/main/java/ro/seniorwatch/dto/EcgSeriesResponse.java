package ro.seniorwatch.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class EcgSeriesResponse {
    private UUID patientId;
    private int samplingHz;
    private int adcMax;
    private int baseline;
    private OffsetDateTime startTs;
    private OffsetDateTime endTs;
    private List<Integer> samples;
}

package ro.seniorwatch.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class AllergyResponse {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private String substanceCode;
    private String substanceDisplay;
    private String reaction;
    private String severity;
    private String status;
    private OffsetDateTime recordedAt;
}
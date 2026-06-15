package ro.seniorwatch.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class RecommendationResponse {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private String tipActivitate;
    private Integer durataZilnicaMinute;
    private String alteIndicatii;
    private OffsetDateTime recordedAt;
    private String status;
}
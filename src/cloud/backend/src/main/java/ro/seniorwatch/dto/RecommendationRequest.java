package ro.seniorwatch.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class RecommendationRequest {
    private UUID patientId;
    private String tipActivitate;
    private Integer durataZilnicaMinute;
    private String alteIndicatii;
}
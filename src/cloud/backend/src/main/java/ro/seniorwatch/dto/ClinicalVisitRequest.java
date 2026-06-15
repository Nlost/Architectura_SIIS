package ro.seniorwatch.dto;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ClinicalVisitRequest {
    private UUID patientId;
    private OffsetDateTime visitedAt;
    private String motivPrezentare;
    private String simptome;
    private String diagnosticIcd10Code;
    private String diagnosticIcd10Display;
    private String trimiteri;
    private String retete;
}
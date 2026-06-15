package ro.seniorwatch.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ClinicalVisitResponse {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private String patientInitials;
    private Integer age;
    private OffsetDateTime visitedAt;
    private String motivPrezentare;
    private String simptome;
    private String diagnosticIcd10Code;
    private String diagnosticIcd10Display;
    private String trimiteri;
    private String retete;
    private String status;
}
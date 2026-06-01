package ro.seniorwatch.dto;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {
    private UUID id;
    private UUID doctorId;
    private boolean active;
    private OffsetDateTime createdAt;
    private DemographicsDto demographics;
}

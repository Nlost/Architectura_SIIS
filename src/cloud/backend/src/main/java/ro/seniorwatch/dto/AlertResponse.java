package ro.seniorwatch.dto;

import lombok.*;
import ro.seniorwatch.entity.enums.AlertSeverity;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    private UUID id;
    private UUID patientId;
    private UUID ruleId;
    private OffsetDateTime triggeredAt;
    private AlertSeverity severitate;
    private String textPacient;
    private OffsetDateTime receivedAt;
}

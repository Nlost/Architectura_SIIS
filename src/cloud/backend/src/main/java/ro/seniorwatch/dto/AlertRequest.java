package ro.seniorwatch.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import ro.seniorwatch.entity.enums.AlertSeverity;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertRequest {
    @NotNull
    private UUID id;
    @NotNull
    private UUID patientId;
    @NotNull
    private UUID ruleId;
    @NotNull
    private OffsetDateTime triggeredAt;
    @NotNull
    private AlertSeverity severitate;
    private String textPacient;
}

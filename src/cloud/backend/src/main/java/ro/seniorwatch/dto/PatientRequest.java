package ro.seniorwatch.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PatientRequest {
    private UUID doctorId;
    @NotNull @Valid
    private DemographicsDto demographics;
}

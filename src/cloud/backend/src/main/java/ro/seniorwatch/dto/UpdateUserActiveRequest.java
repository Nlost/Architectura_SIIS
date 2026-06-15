package ro.seniorwatch.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserActiveRequest {

    @NotNull
    private Boolean active;
}
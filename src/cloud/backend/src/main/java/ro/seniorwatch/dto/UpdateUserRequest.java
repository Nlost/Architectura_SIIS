package ro.seniorwatch.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import ro.seniorwatch.entity.enums.UserRole;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @NotNull
    private UserRole role;
}
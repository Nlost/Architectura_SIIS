package ro.seniorwatch.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import ro.seniorwatch.entity.enums.UserRole;

@Data
public class CreateUserRequest {
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 8)
    private String password;
    @NotNull
    private UserRole role;
}

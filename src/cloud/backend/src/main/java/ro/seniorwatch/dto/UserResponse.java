package ro.seniorwatch.dto;

import lombok.*;
import ro.seniorwatch.entity.enums.UserRole;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private UserRole role;
    private boolean active;
    private OffsetDateTime createdAt;
}

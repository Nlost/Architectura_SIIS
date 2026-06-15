package ro.seniorwatch.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ro.seniorwatch.dto.CreateUserRequest;
import ro.seniorwatch.dto.UserResponse;
import ro.seniorwatch.service.UserService;
import ro.seniorwatch.dto.UpdateUserRequest;
import ro.seniorwatch.dto.UpdateUserActiveRequest;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> listUsers() {
        return ResponseEntity.ok(userService.listUsers());
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.createUser(request));
    }
    @PutMapping("/{id}")
public ResponseEntity<UserResponse> updateUser(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateUserRequest request
) {
    return ResponseEntity.ok(userService.updateUser(id, request));
}

@PatchMapping("/{id}/active")
public ResponseEntity<UserResponse> updateUserActive(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateUserActiveRequest request
) {
    return ResponseEntity.ok(userService.updateUserActive(id, request));
}
}

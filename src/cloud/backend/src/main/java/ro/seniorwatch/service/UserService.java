package ro.seniorwatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.seniorwatch.dto.*;
import ro.seniorwatch.entity.User;
import ro.seniorwatch.repository.UserRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        user = userRepository.save(user);

        try {
            auditService.log(
                    user.getId(),
                    "CREATE",
                    "users",
                    user.getId(),
                    null,
                    "SUCCESS"
            );
        } catch (Exception e) {
            System.out.println("Audit log failed: " + e.getMessage());
        }

        return toResponse(user);
    }

    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        String newEmail = request.getEmail();

        if (newEmail == null || newEmail.isBlank()) {
            throw new IllegalArgumentException("Emailul este obligatoriu");
        }

        if (!user.getEmail().equalsIgnoreCase(newEmail)
                && userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("Există deja un utilizator cu acest email");
        }

        user.setEmail(newEmail);
        user.setRole(request.getRole());
        user.setUpdatedAt(OffsetDateTime.now());

        user = userRepository.save(user);

        try {
            auditService.log(
                    user.getId(),
                    "UPDATE",
                    "users",
                    user.getId(),
                    null,
                    "SUCCESS"
            );
        } catch (Exception e) {
            System.out.println("Audit log failed: " + e.getMessage());
        }

        return toResponse(user);
    }

    @Transactional
    public UserResponse updateUserActive(UUID id, UpdateUserActiveRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        user.setActive(request.getActive());
        user.setUpdatedAt(OffsetDateTime.now());

        return toResponse(userRepository.save(user));
    }

    private UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .role(u.getRole())
                .active(u.isActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
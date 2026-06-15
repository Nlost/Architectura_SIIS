package ro.seniorwatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ro.seniorwatch.dto.LoginRequest;
import ro.seniorwatch.dto.LoginResponse;
import ro.seniorwatch.entity.User;
import ro.seniorwatch.repository.UserRepository;
import ro.seniorwatch.security.JwtUtil;
import org.springframework.transaction.annotation.Transactional;
import ro.seniorwatch.dto.ResetPasswordRequest;
import ro.seniorwatch.entity.User;
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;

    public LoginResponse login(LoginRequest request, String clientIp) {
        User user = userRepository.findByEmail(request.getEmail())
                .filter(User::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            auditService.log(user.getId(), "LOGIN", "users", user.getId(), clientIp, "DENIED");
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        auditService.log(user.getId(), "LOGIN", "users", user.getId(), clientIp, "SUCCESS");

        return LoginResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .email(user.getEmail())
                .build();
    }

    @Transactional
public void resetPassword(ResetPasswordRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("Utilizatorul nu există"));

    if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
        throw new IllegalArgumentException("Parola trebuie să aibă minimum 8 caractere");
    }

    user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
}
}

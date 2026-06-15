package ro.seniorwatch.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.seniorwatch.dto.LoginRequest;
import ro.seniorwatch.dto.LoginResponse;
import ro.seniorwatch.service.AuthService;
import ro.seniorwatch.dto.ResetPasswordRequest;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(authService.login(request, clientIp));
    }
@PostMapping("/reset-password")
public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request);
    return ResponseEntity.ok().build();
}
}

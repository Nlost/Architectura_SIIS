package ro.seniorwatch.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ro.seniorwatch.dto.AllergyRequest;
import ro.seniorwatch.dto.AllergyResponse;
import ro.seniorwatch.service.AllergyService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/allergies")
@RequiredArgsConstructor
public class AllergyController {

    private final AllergyService allergyService;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<AllergyResponse>> listByPatient(
            @PathVariable UUID patientId,
            Authentication auth
    ) {
        return ResponseEntity.ok(allergyService.listByPatient(patientId, auth));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AllergyResponse>> listMyAllergies(Authentication auth) {
        return ResponseEntity.ok(allergyService.listMyAllergies(auth));
    }

    @PostMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<AllergyResponse> createAllergy(
            @PathVariable UUID patientId,
            @RequestBody AllergyRequest request,
            Authentication auth
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(allergyService.createAllergy(patientId, request, auth));
    }

    @PutMapping("/{allergyId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<AllergyResponse> updateAllergy(
            @PathVariable UUID allergyId,
            @RequestBody AllergyRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(allergyService.updateAllergy(allergyId, request, auth));
    }

    @PutMapping("/{allergyId}/archive")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<AllergyResponse> archiveAllergy(
            @PathVariable UUID allergyId,
            Authentication auth
    ) {
        return ResponseEntity.ok(allergyService.archiveAllergy(allergyId, auth));
    }
}
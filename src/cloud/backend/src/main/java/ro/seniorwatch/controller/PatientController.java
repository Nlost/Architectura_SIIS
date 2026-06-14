package ro.seniorwatch.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ro.seniorwatch.dto.PatientRequest;
import ro.seniorwatch.dto.PatientResponse;
import ro.seniorwatch.service.PatientService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<List<PatientResponse>> listPatients(Authentication auth) {
        return ResponseEntity.ok(patientService.listPatients(auth));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponse> getPatient(@PathVariable UUID id) {
        return ResponseEntity.ok(patientService.getPatient(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<PatientResponse> createPatient(@Valid @RequestBody PatientRequest request,
                                                          Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(patientService.createPatient(request, auth));
    }
    
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponse> getMyPatient(Authentication auth) {
            return ResponseEntity.ok(patientService.getMyPatient(auth));
}
@PutMapping("/{id}")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public ResponseEntity<PatientResponse> updatePatient(
        @PathVariable UUID id,
        @Valid @RequestBody PatientRequest request,
        Authentication auth
) {
    return ResponseEntity.ok(patientService.updatePatient(id, request, auth));
}
}

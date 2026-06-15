package ro.seniorwatch.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ro.seniorwatch.dto.ClinicalVisitRequest;
import ro.seniorwatch.dto.ClinicalVisitResponse;
import ro.seniorwatch.service.ClinicalVisitService;
import java.util.UUID;

import java.util.List;

@RestController
@RequestMapping("/clinical-visits")
@RequiredArgsConstructor
public class ClinicalVisitController {

    private final ClinicalVisitService clinicalVisitService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<ClinicalVisitResponse>> listClinicalVisits(Authentication auth) {
        return ResponseEntity.ok(clinicalVisitService.listClinicalVisits(auth));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<ClinicalVisitResponse> createClinicalVisit(
            @RequestBody ClinicalVisitRequest request,
            Authentication auth
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clinicalVisitService.createClinicalVisit(request, auth));
    }
    @PatchMapping("/{id}/finalize")
@PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
public ResponseEntity<ClinicalVisitResponse> finalizeClinicalVisit(
        @PathVariable UUID id,
        Authentication auth
) {
    return ResponseEntity.ok(clinicalVisitService.finalizeClinicalVisit(id, auth));
}

@GetMapping("/patient/me")
@PreAuthorize("hasRole('PATIENT')")
public ResponseEntity<List<ClinicalVisitResponse>> listMyClinicalVisits(Authentication auth) {
    return ResponseEntity.ok(clinicalVisitService.listMyClinicalVisits(auth));
}
}
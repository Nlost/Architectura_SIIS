package ro.seniorwatch.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ro.seniorwatch.dto.RecommendationRequest;
import ro.seniorwatch.dto.RecommendationResponse;
import ro.seniorwatch.service.RecommendationService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<RecommendationResponse> createRecommendation(
            @RequestBody RecommendationRequest request,
            Authentication auth
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recommendationService.createRecommendation(request, auth));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'PATIENT')")
    public ResponseEntity<List<RecommendationResponse>> listByPatient(
            @PathVariable UUID patientId,
            Authentication auth
    ) {
        return ResponseEntity.ok(recommendationService.listByPatient(patientId, auth));
    }
}
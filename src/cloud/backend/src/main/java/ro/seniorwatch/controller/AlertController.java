package ro.seniorwatch.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.seniorwatch.dto.AlertRequest;
import ro.seniorwatch.dto.AlertResponse;
import ro.seniorwatch.service.AlertService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    public ResponseEntity<AlertResponse> submitAlert(@Valid @RequestBody AlertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(alertService.submitAlert(request));
    }

    @GetMapping("/{patientId}")
    public ResponseEntity<List<AlertResponse>> listAlerts(@PathVariable UUID patientId) {
        return ResponseEntity.ok(alertService.listAlerts(patientId));
    }
}

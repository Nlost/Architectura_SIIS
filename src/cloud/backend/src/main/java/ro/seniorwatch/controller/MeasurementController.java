package ro.seniorwatch.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.seniorwatch.dto.MeasurementBatchRequest;
import ro.seniorwatch.dto.MeasurementBatchResponse;
import ro.seniorwatch.service.MeasurementService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/measurements")
@RequiredArgsConstructor
public class MeasurementController {

    private final MeasurementService measurementService;

    @PostMapping
    public ResponseEntity<MeasurementBatchResponse> submitBatch(
            @Valid @RequestBody MeasurementBatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(measurementService.submitBatch(request));
    }

    @GetMapping("/{patientId}")
    public ResponseEntity<List<MeasurementBatchResponse>> listBatches(@PathVariable UUID patientId) {
        return ResponseEntity.ok(measurementService.listBatches(patientId));
    }
}

package ro.seniorwatch.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ro.seniorwatch.dto.AuditResponse;
import ro.seniorwatch.service.AuditService;

import java.util.List;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditResponse>> listAuditEvents() {
        return ResponseEntity.ok(auditService.listLatest());
    }
}
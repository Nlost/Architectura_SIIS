package ro.seniorwatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.seniorwatch.dto.*;
import ro.seniorwatch.entity.*;
import ro.seniorwatch.repository.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertEventRepository alertEventRepository;
    private final PatientRepository patientRepository;
    private final AlarmRuleRepository alarmRuleRepository;

    @Transactional
    public AlertResponse submitAlert(AlertRequest request) {
        if (alertEventRepository.existsById(request.getId())) {
            return alertEventRepository.findById(request.getId())
                    .map(this::toResponse)
                    .orElseThrow();
        }

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new NoSuchElementException("Patient not found: " + request.getPatientId()));

        AlarmRule rule = alarmRuleRepository.findById(request.getRuleId())
                .orElseThrow(() -> new NoSuchElementException("AlarmRule not found: " + request.getRuleId()));

        AlertEvent event = AlertEvent.builder()
                .id(request.getId())
                .patient(patient)
                .rule(rule)
                .triggeredAt(request.getTriggeredAt())
                .severitate(request.getSeveritate())
                .textPacient(request.getTextPacient())
                .build();

        AlertEvent saved = alertEventRepository.save(event);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> listAlerts(UUID patientId) {
        return alertEventRepository.findByPatientIdOrderByTriggeredAtDesc(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AlertResponse toResponse(AlertEvent e) {
        return AlertResponse.builder()
                .id(e.getId())
                .patientId(e.getPatient().getId())
                .ruleId(e.getRule().getId())
                .triggeredAt(e.getTriggeredAt())
                .severitate(e.getSeveritate())
                .textPacient(e.getTextPacient())
                .receivedAt(e.getReceivedAt())
                .build();
    }
}

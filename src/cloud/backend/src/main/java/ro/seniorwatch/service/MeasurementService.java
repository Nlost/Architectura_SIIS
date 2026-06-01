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
public class MeasurementService {

    private final MeasurementBatchRepository batchRepository;
    private final PatientRepository patientRepository;

    @Transactional
    public MeasurementBatchResponse submitBatch(MeasurementBatchRequest request) {
        if (batchRepository.existsById(request.getBatchId())) {
            return batchRepository.findById(request.getBatchId())
                    .map(this::toResponse)
                    .orElseThrow();
        }

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new NoSuchElementException("Patient not found: " + request.getPatientId()));

        MeasurementBatch batch = MeasurementBatch.builder()
                .batchId(request.getBatchId())
                .patient(patient)
                .deviceId(request.getDeviceId())
                .intervalStart(request.getIntervalStart())
                .intervalEnd(request.getIntervalEnd())
                .build();

        if (request.getSamples() != null) {
            List<SensorSample> samples = request.getSamples().stream()
                    .map(dto -> SensorSample.builder()
                            .batch(batch)
                            .ts(dto.getTs())
                            .puls(dto.getPuls())
                            .spo2(dto.getSpo2())
                            .temperatura(dto.getTemperatura())
                            .umiditate(dto.getUmiditate())
                            .build())
                    .toList();
            batch.getSamples().addAll(samples);
        }

        MeasurementBatch saved = batchRepository.save(batch);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MeasurementBatchResponse> listBatches(UUID patientId) {
        return batchRepository.findByPatientIdOrderByIntervalStartDesc(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private MeasurementBatchResponse toResponse(MeasurementBatch b) {
        return MeasurementBatchResponse.builder()
                .batchId(b.getBatchId())
                .patientId(b.getPatient().getId())
                .deviceId(b.getDeviceId())
                .intervalStart(b.getIntervalStart())
                .intervalEnd(b.getIntervalEnd())
                .receivedAt(b.getReceivedAt())
                .sampleCount(b.getSamples().size())
                .build();
    }
}

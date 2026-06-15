package ro.seniorwatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.seniorwatch.dto.*;
import ro.seniorwatch.entity.*;
import ro.seniorwatch.repository.*;

import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MeasurementService {

    private final MeasurementBatchRepository batchRepository;
    private final PatientRepository patientRepository;
    private final SensorSampleRepository sensorSampleRepository;

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
                            .ecgBlob(decodeEcg(dto.getEcgBytes()))
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

    @Transactional(readOnly = true)
    public EcgSeriesResponse getEcgSeries(UUID patientId, int chunkLimit) {
        int limit = Math.max(1, Math.min(chunkLimit, 200));

        List<SensorSample> samples = sensorSampleRepository
                .findByBatchPatientIdAndEcgBlobIsNotNullOrderByTsDesc(
                        patientId, PageRequest.of(0, limit));

        // Repository returns newest-first; replay oldest-first.
        List<SensorSample> ordered = new ArrayList<>(samples);
        Collections.reverse(ordered);

        List<Integer> values = new ArrayList<>();
        for (SensorSample sample : ordered) {
            for (int adc : decodeEcgSamples(sample.getEcgBlob())) {
                values.add(adc);
            }
        }

        return EcgSeriesResponse.builder()
                .patientId(patientId)
                .samplingHz(1000)
                .adcMax(4095)
                .baseline(2048)
                .startTs(ordered.isEmpty() ? null : ordered.get(0).getTs())
                .endTs(ordered.isEmpty() ? null : ordered.get(ordered.size() - 1).getTs())
                .samples(values)
                .build();
    }

    private static byte[] decodeEcg(String ecgBytes) {
        if (ecgBytes == null || ecgBytes.isBlank()) return null;
        try {
            return Base64.getDecoder().decode(ecgBytes);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private static int[] decodeEcgSamples(byte[] blob) {
        if (blob == null || blob.length < 2) return new int[0];
        int count = blob.length / 2;
        int[] out = new int[count];
        for (int i = 0; i < count; i++) {
            int lo = blob[2 * i] & 0xFF;
            int hi = blob[2 * i + 1] & 0xFF;
            out[i] = lo | (hi << 8);
        }
        return out;
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

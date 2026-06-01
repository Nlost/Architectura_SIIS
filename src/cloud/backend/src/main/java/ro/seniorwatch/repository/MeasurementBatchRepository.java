package ro.seniorwatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.seniorwatch.entity.MeasurementBatch;

import java.util.List;
import java.util.UUID;

public interface MeasurementBatchRepository extends JpaRepository<MeasurementBatch, String> {
    List<MeasurementBatch> findByPatientIdOrderByIntervalStartDesc(UUID patientId);
}

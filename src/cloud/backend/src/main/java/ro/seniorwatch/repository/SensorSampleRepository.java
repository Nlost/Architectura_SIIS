package ro.seniorwatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.seniorwatch.entity.SensorSample;

import java.util.Optional;
import java.util.UUID;

public interface SensorSampleRepository extends JpaRepository<SensorSample, Long> {

    Optional<SensorSample> findFirstByBatchPatientIdOrderByTsDesc(UUID patientId);
}
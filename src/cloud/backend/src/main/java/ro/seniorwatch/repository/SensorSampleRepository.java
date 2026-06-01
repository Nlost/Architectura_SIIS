package ro.seniorwatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.seniorwatch.entity.SensorSample;

public interface SensorSampleRepository extends JpaRepository<SensorSample, Long> {
}

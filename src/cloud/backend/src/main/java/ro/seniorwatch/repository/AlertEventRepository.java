package ro.seniorwatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.seniorwatch.entity.AlertEvent;

import java.util.List;
import java.util.UUID;

public interface AlertEventRepository extends JpaRepository<AlertEvent, UUID> {
    List<AlertEvent> findByPatientIdOrderByTriggeredAtDesc(UUID patientId);
}

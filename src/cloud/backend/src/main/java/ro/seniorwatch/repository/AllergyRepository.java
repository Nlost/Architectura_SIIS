package ro.seniorwatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.seniorwatch.entity.Allergy;

import java.util.List;
import java.util.UUID;

public interface AllergyRepository extends JpaRepository<Allergy, UUID> {

    List<Allergy> findByPatientIdOrderByRecordedAtDesc(UUID patientId);

    List<Allergy> findByPatientIdAndStatusOrderByRecordedAtDesc(UUID patientId, ro.seniorwatch.entity.enums.HealthItemStatus status);
}
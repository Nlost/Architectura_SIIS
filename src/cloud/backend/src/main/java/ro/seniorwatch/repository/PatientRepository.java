package ro.seniorwatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.seniorwatch.entity.Patient;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {

    List<Patient> findByDoctorIdAndActiveTrue(UUID doctorId);

    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.demographics WHERE p.id = :id")
    Optional<Patient> findByIdWithDemographics(@Param("id") UUID id);

    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.demographics WHERE p.active = TRUE")
    List<Patient> findAllActiveWithDemographics();

    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.demographics d WHERE d.email = :email")
    Optional<Patient> findByDemographicsEmail(@Param("email") String email);
}
package ro.seniorwatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ro.seniorwatch.entity.ClinicalVisit;

import java.util.List;
import java.util.UUID;

public interface ClinicalVisitRepository extends JpaRepository<ClinicalVisit, UUID> {

    @Query("""
           SELECT cv FROM ClinicalVisit cv
           JOIN FETCH cv.patient p
           LEFT JOIN FETCH p.demographics
           WHERE p.doctor.id = :doctorId
           ORDER BY cv.visitedAt DESC
           """)
    List<ClinicalVisit> findByDoctorId(UUID doctorId);
}
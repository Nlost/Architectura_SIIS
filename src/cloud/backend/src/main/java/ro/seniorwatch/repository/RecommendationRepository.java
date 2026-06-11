package ro.seniorwatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ro.seniorwatch.entity.Recommendation;

import java.util.List;
import java.util.UUID;

public interface RecommendationRepository extends JpaRepository<Recommendation, UUID> {

    @Query("""
           SELECT r FROM Recommendation r
           JOIN FETCH r.patient p
           LEFT JOIN FETCH p.demographics
           WHERE p.id = :patientId
           ORDER BY r.recordedAt DESC
           """)
    List<Recommendation> findByPatientId(UUID patientId);
}
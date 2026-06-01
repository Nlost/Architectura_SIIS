package ro.seniorwatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.seniorwatch.entity.Demographics;

import java.util.UUID;

public interface DemographicsRepository extends JpaRepository<Demographics, UUID> {
}

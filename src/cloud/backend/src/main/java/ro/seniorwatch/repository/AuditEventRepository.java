package ro.seniorwatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.seniorwatch.entity.AuditEvent;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
}

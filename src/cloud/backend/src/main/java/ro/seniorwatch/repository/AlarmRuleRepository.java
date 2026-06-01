package ro.seniorwatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.seniorwatch.entity.AlarmRule;

import java.util.UUID;

public interface AlarmRuleRepository extends JpaRepository<AlarmRule, UUID> {
}

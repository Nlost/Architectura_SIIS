package ro.seniorwatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.seniorwatch.entity.DeviceBinding;

import java.util.UUID;

public interface DeviceBindingRepository extends JpaRepository<DeviceBinding, UUID> {
}

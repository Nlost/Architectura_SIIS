package ro.seniorwatch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "device_bindings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceBinding {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", unique = true)
    private Patient patient;

    @Column(name = "smartphone_device_id", length = 128)
    private String smartphoneDeviceId;

    @Column(name = "sensor_kit_id", nullable = false, unique = true, length = 128)
    private String sensorKitId;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}

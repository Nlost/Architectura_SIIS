package ro.seniorwatch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "measurement_batches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeasurementBatch {

    @Id
    @Column(name = "batch_id", length = 64)
    private String batchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "device_id", length = 128)
    private String deviceId;

    @Column(name = "interval_start", nullable = false)
    private OffsetDateTime intervalStart;

    @Column(name = "interval_end", nullable = false)
    private OffsetDateTime intervalEnd;

    @Column(name = "received_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime receivedAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<SensorSample> samples = new ArrayList<>();
}

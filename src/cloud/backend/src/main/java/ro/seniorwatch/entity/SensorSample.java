package ro.seniorwatch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "sensor_samples")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorSample {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private MeasurementBatch batch;

    @Column(nullable = false)
    private OffsetDateTime ts;

    private Short puls;

    private Short spo2;

    @Column(precision = 4, scale = 1)
    private BigDecimal temperatura;

    @Column(precision = 4, scale = 1)
    private BigDecimal umiditate;

    @Column(name = "ecg_blob")
    private byte[] ecgBlob;
}

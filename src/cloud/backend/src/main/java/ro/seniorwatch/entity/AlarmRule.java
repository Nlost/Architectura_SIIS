package ro.seniorwatch.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import ro.seniorwatch.entity.enums.HealthItemStatus;
import ro.seniorwatch.entity.enums.SensorParameter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "alarm_rules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlarmRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "sensor_parameter")
    private SensorParameter parametru;

    @Column(name = "prag_min", nullable = false, precision = 10, scale = 2)
    private BigDecimal pragMin;

    @Column(name = "prag_max", nullable = false, precision = 10, scale = 2)
    private BigDecimal pragMax;

    @Column(name = "durata_persistenta_sec", nullable = false)
    @Builder.Default
    private int durataPersistentaSec = 0;

    @Column(name = "interval_debut_activitate_sec", nullable = false)
    @Builder.Default
    private int intervalDebutActivitateSec = 0;

    @Column(name = "version_id", nullable = false, unique = true)
    @Builder.Default
    private UUID versionId = UUID.randomUUID();

    @Column(name = "health_item_id", nullable = false)
    @Builder.Default
    private UUID healthItemId = UUID.randomUUID();

    @Column(name = "recorded_at", nullable = false)
    @Builder.Default
    private OffsetDateTime recordedAt = OffsetDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by_user_id")
    private User recordedByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_person_id")
    private User responsiblePerson;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "health_item_status")
    @Builder.Default
    private HealthItemStatus status = HealthItemStatus.ACTIVE;

    @Column(name = "previous_version_id")
    private UUID previousVersionId;
}

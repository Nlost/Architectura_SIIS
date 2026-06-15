package ro.seniorwatch.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import ro.seniorwatch.entity.enums.HealthItemStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "recommendations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "tip_activitate", nullable = false, length = 100)
    private String tipActivitate;

    @Column(name = "durata_zilnica_minute")
    private Integer durataZilnicaMinute;

    @Column(name = "alte_indicatii", columnDefinition = "TEXT")
    private String alteIndicatii;

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
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private HealthItemStatus status = HealthItemStatus.ACTIVE;

    @Column(name = "previous_version_id")
    private UUID previousVersionId;
}
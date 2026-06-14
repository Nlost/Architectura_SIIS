package ro.seniorwatch.entity;

import jakarta.persistence.*;
import lombok.*;
import ro.seniorwatch.entity.enums.HealthItemStatus;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "allergies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Allergy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "substance_code")
    private String substanceCode;

    @Column(name = "substance_display", nullable = false)
    private String substanceDisplay;

    private String reaction;

    private String severity;

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
@Column(name = "status", nullable = false, columnDefinition = "health_item_status")
@Builder.Default
private HealthItemStatus status = HealthItemStatus.ACTIVE;


    @Column(name = "previous_version_id")
    private UUID previousVersionId;
}
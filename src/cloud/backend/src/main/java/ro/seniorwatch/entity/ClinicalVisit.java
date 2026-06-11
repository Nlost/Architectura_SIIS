package ro.seniorwatch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "clinical_visits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClinicalVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "visited_at", nullable = false)
    private OffsetDateTime visitedAt;

    @Column(name = "motiv_prezentare", length = 500)
    private String motivPrezentare;

    @Column(name = "simptome", columnDefinition = "TEXT")
    private String simptome;

    @Column(name = "diagnostic_icd10_code", length = 10)
    private String diagnosticIcd10Code;

    @Column(name = "diagnostic_icd10_display", length = 200)
    private String diagnosticIcd10Display;

    @Column(name = "trimiteri", columnDefinition = "TEXT")
    private String trimiteri;

    @Column(name = "retete", columnDefinition = "TEXT")
    private String retete;

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

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "previous_version_id")
    private UUID previousVersionId;
}
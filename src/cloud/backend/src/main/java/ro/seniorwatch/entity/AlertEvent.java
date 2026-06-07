package ro.seniorwatch.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import ro.seniorwatch.entity.enums.AlertSeverity;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "alert_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertEvent {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id", nullable = false)
    private AlarmRule rule;

    @Column(name = "triggered_at", nullable = false)
    private OffsetDateTime triggeredAt;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "alert_severity")
    private AlertSeverity severitate;

    @Column(name = "text_pacient", length = 500)
    private String textPacient;

    @Column(name = "received_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime receivedAt = OffsetDateTime.now();
}

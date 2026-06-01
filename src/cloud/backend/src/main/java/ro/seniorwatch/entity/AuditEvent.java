package ro.seniorwatch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "occurred_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime occurredAt = OffsetDateTime.now();

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "event_type", nullable = false, length = 32)
    private String eventType;

    @Column(length = 120)
    private String resource;

    @Column(name = "resource_id")
    private UUID resourceId;

    @Column(name = "client_ip", length = 45)
    private String clientIp;

    @Column(nullable = false, length = 16)
    private String outcome;
}

package ro.seniorwatch.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class AuditResponse {
    private Long id;
    private OffsetDateTime occurredAt;
    private UUID userId;
    private String eventType;
    private String resource;
    private UUID resourceId;
    private String clientIp;
    private String outcome;
    private String userEmail;
}
package ro.seniorwatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ro.seniorwatch.dto.AuditResponse;
import ro.seniorwatch.entity.AuditEvent;
import ro.seniorwatch.repository.AuditEventRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditEventRepository auditEventRepository;

    public void log(UUID userId, String eventType, String resource, UUID resourceId, String clientIp, String outcome) {
        auditEventRepository.save(AuditEvent.builder()
                .userId(userId)
                .eventType(eventType)
                .resource(resource)
                .resourceId(resourceId)
                .clientIp(clientIp)
                .outcome(outcome)
                .build());
    }

    public List<AuditResponse> listLatest() {
        return auditEventRepository.findTop200ByOrderByOccurredAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AuditResponse toResponse(AuditEvent e) {
        return AuditResponse.builder()
                .id(e.getId())
                .occurredAt(e.getOccurredAt())
                .userId(e.getUserId())
                .eventType(e.getEventType())
                .resource(e.getResource())
                .resourceId(e.getResourceId())
                .clientIp(e.getClientIp())
                .outcome(e.getOutcome())
                .build();
    }
}
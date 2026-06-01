package ro.seniorwatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ro.seniorwatch.entity.AuditEvent;
import ro.seniorwatch.repository.AuditEventRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditEventRepository auditEventRepository;

    public void log(UUID userId, String eventType, String resource, UUID resourceId,
                    String clientIp, String outcome) {
        auditEventRepository.save(AuditEvent.builder()
                .userId(userId)
                .eventType(eventType)
                .resource(resource)
                .resourceId(resourceId)
                .clientIp(clientIp)
                .outcome(outcome)
                .build());
    }
}

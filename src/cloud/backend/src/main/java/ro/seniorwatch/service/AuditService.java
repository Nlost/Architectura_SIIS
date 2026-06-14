package ro.seniorwatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ro.seniorwatch.dto.AuditResponse;
import ro.seniorwatch.entity.AuditEvent;
import ro.seniorwatch.repository.AuditEventRepository;
import ro.seniorwatch.entity.User;
import ro.seniorwatch.repository.UserRepository;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditEventRepository auditEventRepository;
    private final UserRepository userRepository;

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
    String userEmail = e.getUserId() != null
            ? userRepository.findById(e.getUserId())
                .map(User::getEmail)
                .orElse("Utilizator necunoscut")
            : "Sistem";

    return AuditResponse.builder()
            .id(e.getId())
            .occurredAt(e.getOccurredAt())
            .userId(e.getUserId())
            .userEmail(userEmail)
            .eventType(e.getEventType())
            .resource(e.getResource())
            .resourceId(e.getResourceId())
            .clientIp(e.getClientIp())
            .outcome(e.getOutcome())
            .build();
}
}
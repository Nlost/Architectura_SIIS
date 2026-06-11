package ro.seniorwatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.seniorwatch.dto.RecommendationRequest;
import ro.seniorwatch.dto.RecommendationResponse;
import ro.seniorwatch.entity.Demographics;
import ro.seniorwatch.entity.Patient;
import ro.seniorwatch.entity.Recommendation;
import ro.seniorwatch.entity.User;
import ro.seniorwatch.entity.enums.HealthItemStatus;
import ro.seniorwatch.entity.enums.UserRole;
import ro.seniorwatch.repository.PatientRepository;
import ro.seniorwatch.repository.RecommendationRepository;
import ro.seniorwatch.repository.UserRepository;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Transactional
    public RecommendationResponse createRecommendation(
            RecommendationRequest request,
            Authentication auth
    ) {
        String email = (String) auth.getPrincipal();

        User caller = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Patient patient = patientRepository.findByIdWithDemographics(request.getPatientId())
                .orElseThrow(() -> new NoSuchElementException("Patient not found"));

        if (caller.getRole() != UserRole.ADMIN &&
                !patient.getDoctor().getId().equals(caller.getId())) {
            throw new IllegalArgumentException("Pacientul nu aparține medicului autentificat");
        }

        Recommendation recommendation = Recommendation.builder()
                .patient(patient)
                .tipActivitate(request.getTipActivitate())
                .durataZilnicaMinute(request.getDurataZilnicaMinute())
                .alteIndicatii(request.getAlteIndicatii())
                .recordedByUser(caller)
                .responsiblePerson(patient.getDoctor())
                .status(HealthItemStatus.ACTIVE)
                .build();

        recommendation = recommendationRepository.save(recommendation);

        return toResponse(recommendation);
    }

    @Transactional(readOnly = true)
    public List<RecommendationResponse> listByPatient(UUID patientId, Authentication auth) {
        String email = (String) auth.getPrincipal();

        User caller = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Patient patient = patientRepository.findByIdWithDemographics(patientId)
                .orElseThrow(() -> new NoSuchElementException("Patient not found"));

        if (caller.getRole() != UserRole.ADMIN &&
                caller.getRole() != UserRole.PATIENT &&
                !patient.getDoctor().getId().equals(caller.getId())) {
            throw new IllegalArgumentException("Nu ai acces la recomandările acestui pacient");
        }

        return recommendationRepository.findByPatientId(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private RecommendationResponse toResponse(Recommendation r) {
        Demographics d = r.getPatient().getDemographics();

        String fullName = "Pacient";
        if (d != null) {
            String nume = d.getNume() != null ? d.getNume() : "";
            String prenume = d.getPrenume() != null ? d.getPrenume() : "";
            fullName = (nume + " " + prenume).trim();
        }

        return RecommendationResponse.builder()
                .id(r.getId())
                .patientId(r.getPatient().getId())
                .patientName(fullName)
                .tipActivitate(r.getTipActivitate())
                .durataZilnicaMinute(r.getDurataZilnicaMinute())
                .alteIndicatii(r.getAlteIndicatii())
                .recordedAt(r.getRecordedAt())
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .build();
    }
}
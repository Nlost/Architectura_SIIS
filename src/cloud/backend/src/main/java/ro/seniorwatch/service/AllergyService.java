package ro.seniorwatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.seniorwatch.dto.AllergyRequest;
import ro.seniorwatch.dto.AllergyResponse;
import ro.seniorwatch.entity.Allergy;
import ro.seniorwatch.entity.Demographics;
import ro.seniorwatch.entity.Patient;
import ro.seniorwatch.entity.User;
import ro.seniorwatch.entity.enums.HealthItemStatus;
import ro.seniorwatch.entity.enums.UserRole;
import ro.seniorwatch.repository.AllergyRepository;
import ro.seniorwatch.repository.PatientRepository;
import ro.seniorwatch.repository.UserRepository;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AllergyService {

    private final AllergyRepository allergyRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<AllergyResponse> listByPatient(UUID patientId, Authentication auth) {
        User caller = getCaller(auth);

        Patient patient = patientRepository.findByIdWithDemographics(patientId)
                .orElseThrow(() -> new NoSuchElementException("Patient not found"));

        if (caller.getRole() == UserRole.DOCTOR &&
                !patient.getDoctor().getId().equals(caller.getId())) {
            throw new IllegalArgumentException("Pacientul nu aparține medicului autentificat");
        }

        return allergyRepository.findByPatientIdOrderByRecordedAtDesc(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AllergyResponse> listMyAllergies(Authentication auth) {
        String email = (String) auth.getPrincipal();

        Patient patient = patientRepository.findByDemographicsEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Patient not found for email: " + email));

        return allergyRepository.findByPatientIdOrderByRecordedAtDesc(patient.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AllergyResponse createAllergy(UUID patientId, AllergyRequest request, Authentication auth) {
        User caller = getCaller(auth);

        Patient patient = patientRepository.findByIdWithDemographics(patientId)
                .orElseThrow(() -> new NoSuchElementException("Patient not found"));

        if (caller.getRole() != UserRole.ADMIN &&
                !patient.getDoctor().getId().equals(caller.getId())) {
            throw new IllegalArgumentException("Pacientul nu aparține medicului autentificat");
        }

        Allergy allergy = Allergy.builder()
                .patient(patient)
                .substanceCode(request.getSubstanceCode())
                .substanceDisplay(request.getSubstanceDisplay())
                .reaction(request.getReaction())
                .severity(request.getSeverity())
                .recordedByUser(caller)
                .responsiblePerson(patient.getDoctor())
                .status(HealthItemStatus.ACTIVE)
                .build();

        allergy = allergyRepository.save(allergy);
     try {
    auditService.log(
            caller.getId(),
            "CREATE",
            "allergies",
            allergy.getId(),
            null,
            "SUCCESS"
    );
} catch (Exception e) {
    System.out.println("Audit log failed: " + e.getMessage());
}

        return toResponse(allergy);
    }

    @Transactional
    public AllergyResponse updateAllergy(UUID allergyId, AllergyRequest request, Authentication auth) {
        User caller = getCaller(auth);

        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new NoSuchElementException("Allergy not found"));

        Patient patient = allergy.getPatient();

        if (caller.getRole() != UserRole.ADMIN &&
                !patient.getDoctor().getId().equals(caller.getId())) {
            throw new IllegalArgumentException("Pacientul nu aparține medicului autentificat");
        }

        allergy.setSubstanceCode(request.getSubstanceCode());
        allergy.setSubstanceDisplay(request.getSubstanceDisplay());
        allergy.setReaction(request.getReaction());
        allergy.setSeverity(request.getSeverity());

        return toResponse(allergyRepository.save(allergy));
    }

    @Transactional
    public AllergyResponse archiveAllergy(UUID allergyId, Authentication auth) {
        User caller = getCaller(auth);

        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new NoSuchElementException("Allergy not found"));

        Patient patient = allergy.getPatient();

        if (caller.getRole() != UserRole.ADMIN &&
                !patient.getDoctor().getId().equals(caller.getId())) {
            throw new IllegalArgumentException("Pacientul nu aparține medicului autentificat");
        }

        allergy.setStatus(HealthItemStatus.ARCHIVED);

        return toResponse(allergyRepository.save(allergy));
    }

    private User getCaller(Authentication auth) {
        String email = (String) auth.getPrincipal();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
    }

    private AllergyResponse toResponse(Allergy allergy) {
        Patient patient = allergy.getPatient();
        Demographics d = patient.getDemographics();

        String patientName = "Pacient";

        if (d != null) {
            String nume = d.getNume() != null ? d.getNume() : "";
            String prenume = d.getPrenume() != null ? d.getPrenume() : "";
            patientName = (nume + " " + prenume).trim();
        }

        return AllergyResponse.builder()
                .id(allergy.getId())
                .patientId(patient.getId())
                .patientName(patientName)
                .substanceCode(allergy.getSubstanceCode())
                .substanceDisplay(allergy.getSubstanceDisplay())
                .reaction(allergy.getReaction())
                .severity(allergy.getSeverity())
                .status(allergy.getStatus() != null ? allergy.getStatus().name() : null)
                .recordedAt(allergy.getRecordedAt())
                .build();
    }
}
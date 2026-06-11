package ro.seniorwatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.seniorwatch.dto.ClinicalVisitRequest;
import ro.seniorwatch.dto.ClinicalVisitResponse;
import ro.seniorwatch.entity.ClinicalVisit;
import ro.seniorwatch.entity.Demographics;
import ro.seniorwatch.entity.Patient;
import ro.seniorwatch.entity.User;
import ro.seniorwatch.entity.enums.UserRole;
import ro.seniorwatch.repository.ClinicalVisitRepository;
import ro.seniorwatch.repository.PatientRepository;
import ro.seniorwatch.repository.UserRepository;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ClinicalVisitService {

    private final ClinicalVisitRepository clinicalVisitRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ClinicalVisitResponse> listClinicalVisits(Authentication auth) {
        String email = (String) auth.getPrincipal();

        User caller = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        return clinicalVisitRepository.findByDoctorId(caller.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ClinicalVisitResponse createClinicalVisit(ClinicalVisitRequest request, Authentication auth) {
        String email = (String) auth.getPrincipal();

        User caller = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Patient patient = patientRepository.findByIdWithDemographics(request.getPatientId())
                .orElseThrow(() -> new NoSuchElementException("Patient not found"));

        if (caller.getRole() != UserRole.ADMIN &&
                !patient.getDoctor().getId().equals(caller.getId())) {
            throw new IllegalArgumentException("Pacientul nu aparține medicului autentificat");
        }

        ClinicalVisit visit = ClinicalVisit.builder()
                .patient(patient)
                .visitedAt(request.getVisitedAt())
                .motivPrezentare(request.getMotivPrezentare())
                .simptome(request.getSimptome())
                .diagnosticIcd10Code(request.getDiagnosticIcd10Code())
                .diagnosticIcd10Display(request.getDiagnosticIcd10Display())
                .trimiteri(request.getTrimiteri())
                .retete(request.getRetete())
                .recordedByUser(caller)
                .responsiblePerson(patient.getDoctor())
                .status("ACTIVE")
                .build();

        visit = clinicalVisitRepository.save(visit);

        return toResponse(visit);
    }

    private ClinicalVisitResponse toResponse(ClinicalVisit visit) {
        Patient patient = visit.getPatient();
        Demographics d = patient.getDemographics();

        String fullName = "Pacient";
        String initials = "?";
        Integer age = null;

        if (d != null) {
            String nume = d.getNume() != null ? d.getNume() : "";
            String prenume = d.getPrenume() != null ? d.getPrenume() : "";

            fullName = (nume + " " + prenume).trim();

            initials = ((nume.isBlank() ? "" : nume.substring(0, 1)) +
                    (prenume.isBlank() ? "" : prenume.substring(0, 1)))
                    .toUpperCase();

            if (d.getDataNasterii() != null) {
                age = Period.between(d.getDataNasterii(), LocalDate.now()).getYears();
            }
        }

        return ClinicalVisitResponse.builder()
                .id(visit.getId())
                .patientId(patient.getId())
                .patientName(fullName)
                .patientInitials(initials)
                .age(age)
                .visitedAt(visit.getVisitedAt())
                .motivPrezentare(visit.getMotivPrezentare())
                .simptome(visit.getSimptome())
                .diagnosticIcd10Code(visit.getDiagnosticIcd10Code())
                .diagnosticIcd10Display(visit.getDiagnosticIcd10Display())
                .trimiteri(visit.getTrimiteri())
                .retete(visit.getRetete())
                .status(visit.getStatus())
                .build();
    }
}
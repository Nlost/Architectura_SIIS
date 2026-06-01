package ro.seniorwatch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.seniorwatch.dto.*;
import ro.seniorwatch.entity.*;
import ro.seniorwatch.entity.enums.UserRole;
import ro.seniorwatch.repository.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final DemographicsRepository demographicsRepository;

    @Transactional(readOnly = true)
    public List<PatientResponse> listPatients(Authentication auth) {
        String email = (String) auth.getPrincipal();
        User caller = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        List<Patient> patients;
        if (caller.getRole() == UserRole.ADMIN) {
            patients = patientRepository.findAllActiveWithDemographics();
        } else {
            patients = patientRepository.findByDoctorIdAndActiveTrue(caller.getId());
        }
        return patients.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatient(UUID id) {
        Patient patient = patientRepository.findByIdWithDemographics(id)
                .orElseThrow(() -> new NoSuchElementException("Patient not found: " + id));
        return toResponse(patient);
    }

    @Transactional
    public PatientResponse createPatient(PatientRequest request, Authentication auth) {
        String email = (String) auth.getPrincipal();
        User caller = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        UUID doctorId = (request.getDoctorId() != null && caller.getRole() == UserRole.ADMIN)
                ? request.getDoctorId()
                : caller.getId();

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new NoSuchElementException("Doctor not found: " + doctorId));

        Patient patient = Patient.builder()
                .doctor(doctor)
                .build();
        patient = patientRepository.save(patient);

        DemographicsDto dto = request.getDemographics();
        Demographics demo = Demographics.builder()
                .patient(patient)
                .nume(dto.getNume())
                .prenume(dto.getPrenume())
                .sex(dto.getSex())
                .dataNasterii(dto.getDataNasterii())
                .cnp(dto.getCnp())
                .strada(dto.getStrada())
                .localitate(dto.getLocalitate())
                .judet(dto.getJudet())
                .codPostal(dto.getCodPostal())
                .tara(dto.getTara() != null ? dto.getTara() : "Romania")
                .telefon(dto.getTelefon())
                .email(dto.getEmail())
                .profesie(dto.getProfesie())
                .locDeMunca(dto.getLocDeMunca())
                .build();
        demographicsRepository.save(demo);
        patient.setDemographics(demo);

        return toResponse(patient);
    }

    private PatientResponse toResponse(Patient p) {
        DemographicsDto demoDto = null;
        if (p.getDemographics() != null) {
            Demographics d = p.getDemographics();
            demoDto = DemographicsDto.builder()
                    .nume(d.getNume())
                    .prenume(d.getPrenume())
                    .sex(d.getSex())
                    .dataNasterii(d.getDataNasterii())
                    .cnp(d.getCnp())
                    .strada(d.getStrada())
                    .localitate(d.getLocalitate())
                    .judet(d.getJudet())
                    .codPostal(d.getCodPostal())
                    .tara(d.getTara())
                    .telefon(d.getTelefon())
                    .email(d.getEmail())
                    .profesie(d.getProfesie())
                    .locDeMunca(d.getLocDeMunca())
                    .build();
        }
        return PatientResponse.builder()
                .id(p.getId())
                .doctorId(p.getDoctor() != null ? p.getDoctor().getId() : null)
                .active(p.isActive())
                .createdAt(p.getCreatedAt())
                .demographics(demoDto)
                .build();
    }
}

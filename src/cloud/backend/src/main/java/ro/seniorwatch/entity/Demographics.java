package ro.seniorwatch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "demographics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Demographics {

    @Id
    @Column(name = "patient_id")
    private UUID patientId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(nullable = false, length = 80)
    private String nume;

    @Column(nullable = false, length = 80)
    private String prenume;

    @Column(length = 1)
    private String sex;

    @Column(name = "data_nasterii", nullable = false)
    private LocalDate dataNasterii;

    @Column(length = 13, unique = true)
    private String cnp;

    @Column(length = 80)
    private String strada;

    @Column(length = 80)
    private String localitate;

    @Column(length = 80)
    private String judet;

    @Column(name = "cod_postal", length = 10)
    private String codPostal;

    @Column(length = 80)
    @Builder.Default
    private String tara = "Romania";

    @Column(length = 20)
    private String telefon;

    @Column(length = 120)
    private String email;

    @Column(length = 120)
    private String profesie;

    @Column(name = "loc_de_munca", length = 120)
    private String locDeMunca;
}

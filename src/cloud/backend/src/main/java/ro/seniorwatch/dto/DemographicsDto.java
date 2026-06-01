package ro.seniorwatch.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemographicsDto {
    @NotBlank
    private String nume;
    @NotBlank
    private String prenume;
    private String sex;
    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataNasterii;
    private String cnp;
    private String strada;
    private String localitate;
    private String judet;
    private String codPostal;
    private String tara;
    private String telefon;
    private String email;
    private String profesie;
    private String locDeMunca;
}

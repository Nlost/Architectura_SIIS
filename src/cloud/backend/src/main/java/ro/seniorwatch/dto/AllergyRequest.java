package ro.seniorwatch.dto;

import lombok.Data;

@Data
public class AllergyRequest {
    private String substanceCode;
    private String substanceDisplay;
    private String reaction;
    private String severity;
}
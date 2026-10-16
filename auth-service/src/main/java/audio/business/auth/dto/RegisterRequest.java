package audio.business.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank
        String firstName,

        @NotBlank
        String lastName,

        String middleName,

        @NotBlank
        LocalDate birthDate,

        @NotBlank
        @Email
        String email,

        @NotBlank
        @Pattern(regexp = "^\\+([0-9\\-]?){9,11}[0-9]$")
        String phone,

        @NotBlank
        @Size(min = 8, max = 72)
        String password
) {}

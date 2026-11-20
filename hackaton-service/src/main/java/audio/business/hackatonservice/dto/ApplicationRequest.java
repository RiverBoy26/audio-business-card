package audio.business.hackatonservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record ApplicationRequest(
        @NotNull
        UUID audioCardId,

        @Size(max = 1000)
        String message
) {}

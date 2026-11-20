package audio.business.hackatonservice.dto;

import audio.business.hackatonservice.model.EventFormat;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.Set;

public record RecruitmentRequest(
        @NotBlank @Size(max = 150)
        String title,

        @NotBlank @Size(max = 150)
        String eventName,

        @NotBlank @Size(max = 5000)
        String description,

        @Min(1) @Max(100)
        int participantsNeeded,

        @Size(max = 20)
        Set<@NotBlank @Size(max = 50) String> requiredSkills,

        @NotNull
        EventFormat format,

        @Size(max = 255)
        String location,

        @Size(max = 500)
        String eventUrl,

        @NotNull @Future
        Instant deadline
) {}

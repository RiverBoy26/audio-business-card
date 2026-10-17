package audio.business.hackatonservice.dto;

import audio.business.hackatonservice.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record ApplicationStatusRequest(
        @NotNull ApplicationStatus status
) {}

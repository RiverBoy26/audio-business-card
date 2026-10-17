package audio.business.hackatonservice.dto;

import audio.business.hackatonservice.model.ApplicationStatus;
import java.time.Instant;
import java.util.UUID;

public record ApplicationResponse(
        UUID id,
        UUID recruitmentId,
        UUID applicantId,
        UUID audioCardId,
        String message,
        ApplicationStatus status,
        Instant viewedAt,
        Instant decidedAt,
        Instant createdAt,
        Instant updatedAt
) {}

package audio.business.hackatonservice.dto;

import audio.business.hackatonservice.model.EventFormat;
import audio.business.hackatonservice.model.RecruitmentStatus;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record RecruitmentResponse(
        UUID id,
        UUID creatorId,
        String title,
        String eventName,
        String description,
        int participantsNeeded,
        long acceptedCount,
        Set<String> requiredSkills,
        EventFormat format,
        String location,
        String eventUrl,
        Instant deadline,
        RecruitmentStatus status,
        Instant createdAt,
        Instant updatedAt
) {}

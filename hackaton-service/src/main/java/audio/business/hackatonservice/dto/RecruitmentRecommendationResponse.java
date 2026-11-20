package audio.business.hackatonservice.dto;

import java.util.List;
import java.util.UUID;

public record RecruitmentRecommendationResponse(
        RecruitmentResponse recruitment,
        int score,
        List<String> matchedSkills,
        List<String> missingSkills,
        List<UUID> matchingCardIds,
        List<String> reasons) {
}

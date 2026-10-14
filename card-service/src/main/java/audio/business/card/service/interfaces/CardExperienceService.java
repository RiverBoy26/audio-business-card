package audio.business.card.service.interfaces;

import audio.business.card.dto.request.CardExperienceRequest;
import audio.business.card.dto.response.CardExperienceResponse;

import java.util.UUID;

public interface CardExperienceService {

    CardExperienceResponse findByAudioCardId(UUID userId, UUID audioCardId);

    CardExperienceResponse update(UUID userId, UUID audioCardId, CardExperienceRequest request);
}
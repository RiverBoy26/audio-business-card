package audio.business.card.service.interfaces;

import audio.business.card.dto.response.CardSettingResponse;
import audio.business.card.dto.request.CardSettingsRequest;

import java.util.UUID;

public interface CardSettingsService {

    CardSettingResponse findByAudioCardId(UUID userId, UUID audioCardId);

    CardSettingResponse update(UUID userId, UUID audioCardId,
                               CardSettingsRequest newCardSettings);

}

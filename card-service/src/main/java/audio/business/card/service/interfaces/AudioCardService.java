package audio.business.card.service.interfaces;

import audio.business.card.dto.request.AudioCardRequest;
import audio.business.card.dto.response.AudioCardResponse;

import java.util.List;
import java.util.UUID;

public interface AudioCardService {
    List<AudioCardResponse> findAllByUserId(UUID userId);

    AudioCardResponse findById(UUID audioCardId);

    AudioCardResponse create(UUID userId, AudioCardRequest audioCard);

    AudioCardResponse update(UUID userId, UUID audioCardId, AudioCardRequest newAudioCard);

    void delete(UUID userId, UUID audioCardId);
}

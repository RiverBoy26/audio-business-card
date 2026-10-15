package audio.business.card.mapper;

import audio.business.card.dto.request.AudioCardRequest;
import audio.business.card.dto.response.AudioCardResponse;
import audio.business.card.entity.AudioCard;

public class AudioCardMapper {
    public static AudioCardResponse toResponse(AudioCard card) {
        AudioCardResponse response = new AudioCardResponse();

        response.setId(card.getId());
        response.setTitle(card.getTitle());
        response.setDescription(card.getDescription());
        response.setPhotoUrl(card.getPhotoUrl());

        return response;
    }

    public static AudioCard toEntity(AudioCardRequest request) {
        AudioCard card = new AudioCard();

        card.setTitle(request.getTitle());
        card.setDescription(request.getDescription());
        card.setPhotoUrl(request.getPhotoUrl());

        return card;
    }
}

package audio.business.card.mapper;

import audio.business.card.dto.response.CardSphereResponse;
import audio.business.card.entity.AudioCard;
import audio.business.card.entity.CardSphere;
import audio.business.card.entity.Sphere;

public class CardSphereMapper {

    public static CardSphere toEntity(AudioCard audioCard, Sphere sphere) {
        CardSphere cardSphere = new CardSphere();

        cardSphere.setAudioCard(audioCard);
        cardSphere.setSphere(sphere);

        return cardSphere;
    }

    public static CardSphereResponse toResponse(CardSphere cardSphere) {
        CardSphereResponse response = new CardSphereResponse();

        response.setId(cardSphere.getId());
        response.setSphereId(cardSphere.getSphere().getId());
        response.setSphereName(cardSphere.getSphere().getName());

        return response;
    }
}
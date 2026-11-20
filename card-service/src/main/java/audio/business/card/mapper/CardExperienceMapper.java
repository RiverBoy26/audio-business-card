package audio.business.card.mapper;

import audio.business.card.dto.request.CardExperienceRequest;
import audio.business.card.dto.response.CardExperienceResponse;
import audio.business.card.entity.AudioCard;
import audio.business.card.entity.CardExperience;

public class CardExperienceMapper {

    public static CardExperience toEntity(CardExperienceRequest cardExperienceRequest,
                                          AudioCard audioCard) {
        CardExperience experience = new CardExperience();

        experience.setExperienceYears(cardExperienceRequest.getExperienceYears());
        experience.setAudioCard(audioCard);

        return experience;
    }

    public static CardExperienceResponse toResponse(CardExperience cardExperience) {
        CardExperienceResponse response = new CardExperienceResponse();

        response.setCardId(cardExperience.getAudioCard().getId());
        response.setExperienceYears(cardExperience.getExperienceYears());

        return response;
    }
}
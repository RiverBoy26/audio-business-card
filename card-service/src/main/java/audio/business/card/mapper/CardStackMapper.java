package audio.business.card.mapper;

import audio.business.card.dto.response.CardStackResponse;
import audio.business.card.entity.AudioCard;
import audio.business.card.entity.CardStack;
import audio.business.card.entity.Stack;

public class CardStackMapper {

    public static CardStack toEntity(AudioCard audioCard, Stack stack) {
        CardStack cardStack = new CardStack();

        cardStack.setAudioCard(audioCard);
        cardStack.setStack(stack);

        return cardStack;
    }

    public static CardStackResponse toResponse(CardStack cardStack) {
        CardStackResponse response = new CardStackResponse();

        response.setId(cardStack.getId());
        response.setStackId(cardStack.getStack().getId());
        response.setStackName(cardStack.getStack().getName());

        return response;
    }
}
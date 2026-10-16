package audio.business.card.dto.response;

import audio.business.card.enums.CardType;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AudioCardResponse {
    private UUID id;
    private String title;
    private String description;
    private String photoUrl;
    private CardType cardType;
    private UUID musicId;
    private String desiredPosition;
}
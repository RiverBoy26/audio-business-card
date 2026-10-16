package audio.business.card.dto.request;

import audio.business.card.enums.CardType;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AudioCardRequest {
    private String title;
    private String description;
    private String photoUrl;
    private CardType cardType;
    private UUID musicId;
    private String desiredPosition;
}

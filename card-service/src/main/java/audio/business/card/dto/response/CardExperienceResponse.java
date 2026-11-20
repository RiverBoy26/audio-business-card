package audio.business.card.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CardExperienceResponse {
    private UUID cardId;
    private Integer experienceYears;
}

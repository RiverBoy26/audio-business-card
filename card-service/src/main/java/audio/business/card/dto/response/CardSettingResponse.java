package audio.business.card.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CardSettingResponse {
    private UUID cardId;
    private Integer voiceVolume;
    private Integer musicVolume;
    private Integer musicStartSeconds;
}

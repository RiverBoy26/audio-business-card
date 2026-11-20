package audio.business.card.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CardSettingsRequest {
    @Min(0)
    @Max(100)
    private Integer voiceVolume;

    @Min(0)
    @Max(100)
    private Integer musicVolume;

    @Min(0)
    @Max(86400)
    private Integer musicStartSeconds;
}

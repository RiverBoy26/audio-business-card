package audio.business.card.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CardExperienceRequest {
    @Min(0)
    @Max(80)
    private Integer experienceYears;
}

package audio.business.card.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AudioCardRequest {
    private String title;
    private String description;
    private String photoUrl;
}

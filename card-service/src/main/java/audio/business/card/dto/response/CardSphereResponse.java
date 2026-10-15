package audio.business.card.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CardSphereResponse {
    private UUID id;
    private UUID sphereId;
    private String sphereName;
}